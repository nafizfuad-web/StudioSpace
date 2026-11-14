/* eslint-disable @next/next/no-img-element */
"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  formatLocation,
  getCategoryLabel,
  getStudioCoverImage,
  type Studio,
} from "@/lib/studios";
import { getCityCoordinate } from "@/lib/studioLocations";

const TILE_SIZE = 256;
const MAX_ZOOM = 16;
const MIN_ZOOM_FLOOR = 0.35;

interface MapPoint {
  studio: Studio;
  lat: number;
  lng: number;
  cityKey: string;
}

interface ScreenMarker {
  point: MapPoint;
  x: number;
  y: number;
}

interface MarkerCluster {
  key: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  members: ScreenMarker[];
}

interface MapDimensions {
  width: number;
  height: number;
}

interface MapView {
  lat: number;
  lng: number;
  zoom: number;
}

interface StudioMapProps {
  studios: Studio[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onShowInList?: () => void;
  className?: string;
}

function clampLatitude(lat: number): number {
  return Math.max(-85.0511, Math.min(85.0511, lat));
}

function wrapLongitude(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

function project(lat: number, lng: number, zoom: number) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const sin = Math.sin((clampLatitude(lat) * Math.PI) / 180);
  const clampedSin = Math.max(Math.min(sin, 0.9999), -0.9999);

  return {
    x: ((lng + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) *
      scale,
  };
}

function unproject(x: number, y: number, zoom: number) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const mercatorY = Math.PI - (2 * Math.PI * y) / scale;
  const lat =
    (180 / Math.PI) * Math.atan(0.5 * (Math.exp(mercatorY) - Math.exp(-mercatorY)));

  return {
    lat: clampLatitude(lat),
    lng: wrapLongitude(lng),
  };
}

function getMinZoom(width: number): number {
  if (width <= 0) return MIN_ZOOM_FLOOR;

  // Keep the repeated world just wider than the viewport so a place is never
  // drawn twice at the same time.
  return Math.max(MIN_ZOOM_FLOOR, Math.log2(width / TILE_SIZE) + 0.02);
}

function useMapTheme(): "dark" | "light" {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;

    const readTheme = () => {
      setTheme(root.dataset.theme === "light" ? "light" : "dark");
    };

    readTheme();

    const observer = new MutationObserver(readTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

export const StudioMap: React.FC<StudioMapProps> = ({
  studios,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  onShowInList,
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startLat: number;
    startLng: number;
    moved: boolean;
  } | null>(null);

  const [dimensions, setDimensions] = useState<MapDimensions>({
    width: 0,
    height: 0,
  });
  const [view, setView] = useState<MapView>({ lat: 25, lng: 5, zoom: 1.5 });
  const [isDragging, setIsDragging] = useState(false);
  const mapTheme = useMapTheme();
  const helpId = useId();

  const points = useMemo<MapPoint[]>(
    () =>
      studios.flatMap((studio) => {
        const coordinate = getCityCoordinate(studio.location?.city);
        if (!coordinate) return [];

        return [
          {
            studio,
            lat: coordinate.lat,
            lng: coordinate.lng,
            cityKey: (studio.location?.city ?? "").trim().toLowerCase(),
          },
        ];
      }),
    [studios]
  );

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const updateSize = () => {
      const next = {
        width: element.clientWidth,
        height: element.clientHeight,
      };

      setDimensions((previous) =>
        previous.width === next.width && previous.height === next.height
          ? previous
          : next
      );
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const fitToPoints = useCallback(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;

    const minZoom = getMinZoom(width);

    if (points.length === 0) {
      setView({ lat: 25, lng: 5, zoom: Math.max(minZoom, 1) });
      return;
    }

    const worldPoints = points.map((point) => project(point.lat, point.lng, 0));
    const xs = worldPoints.map((point) => point.x);
    const ys = worldPoints.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = Math.min(72, Math.max(24, Math.min(width, height) * 0.09));
    const availableWidth = Math.max(40, width - padding * 2);
    const availableHeight = Math.max(40, height - padding * 2);
    const spanX = Math.max(0.0001, maxX - minX);
    const spanY = Math.max(0.0001, maxY - minY);

    const zoom = Math.max(
      minZoom,
      Math.min(
        MAX_ZOOM,
        10,
        Math.log2(availableWidth / spanX),
        Math.log2(availableHeight / spanY)
      )
    );

    const center = unproject((minX + maxX) / 2, (minY + maxY) / 2, 0);

    setView({
      lat: center.lat,
      lng: center.lng,
      zoom,
    });
  }, [dimensions, points]);

  useEffect(() => {
    // Wait one frame so the map has laid out before measuring and fitting.
    const frame = window.requestAnimationFrame(() => fitToPoints());

    return () => window.cancelAnimationFrame(frame);
  }, [fitToPoints]);

  const zoomAtScreenPoint = useCallback(
    (offsetX: number, offsetY: number, delta: number) => {
      const minZoom = getMinZoom(dimensions.width);

      setView((current) => {
        const nextZoom = Math.max(
          minZoom,
          Math.min(MAX_ZOOM, current.zoom + delta)
        );

        if (Math.abs(nextZoom - current.zoom) < 0.001) return current;

        const center = project(current.lat, current.lng, current.zoom);
        const anchorX = center.x + offsetX;
        const anchorY = center.y + offsetY;
        const factor = Math.pow(2, nextZoom - current.zoom);
        const nextCenter = unproject(
          anchorX * factor - offsetX,
          anchorY * factor - offsetY,
          nextZoom
        );

        return {
          lat: nextCenter.lat,
          lng: nextCenter.lng,
          zoom: nextZoom,
        };
      });
    },
    [dimensions.width]
  );

  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (
        (event.target as HTMLElement | null)?.closest("[data-map-overlay]")
      ) {
        return;
      }

      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;

      zoomAtScreenPoint(
        offsetX,
        offsetY,
        event.deltaY > 0 ? -0.55 : 0.55
      );
    };

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => element.removeEventListener("wheel", handleWheel);
  }, [zoomAtScreenPoint]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-map-overlay]")) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLat: view.lat,
      startLng: view.lng,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (Math.abs(deltaX) + Math.abs(deltaY) > 3) {
      drag.moved = true;
    }

    const center = project(drag.startLat, drag.startLng, view.zoom);
    const next = unproject(center.x - deltaX, center.y - deltaY, view.zoom);

    setView((current) => ({
      ...current,
      lat: next.lat,
      lng: next.lng,
    }));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setIsDragging(false);
  };

  const panBy = (deltaX: number, deltaY: number) => {
    setView((current) => {
      const center = project(current.lat, current.lng, current.zoom);
      const next = unproject(
        center.x + deltaX,
        center.y + deltaY,
        current.zoom
      );

      return {
        ...current,
        lat: next.lat,
        lng: next.lng,
      };
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    const panStep = 90;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        panBy(0, -panStep);
        break;
      case "ArrowDown":
        event.preventDefault();
        panBy(0, panStep);
        break;
      case "ArrowLeft":
        event.preventDefault();
        panBy(-panStep, 0);
        break;
      case "ArrowRight":
        event.preventDefault();
        panBy(panStep, 0);
        break;
      case "+":
      case "=":
        event.preventDefault();
        zoomAtScreenPoint(0, 0, 0.75);
        break;
      case "-":
      case "_":
        event.preventDefault();
        zoomAtScreenPoint(0, 0, -0.75);
        break;
      case "Home":
        event.preventDefault();
        fitToPoints();
        break;
      default:
        break;
    }
  };

  const frame = useMemo(() => {
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return null;

    const center = project(view.lat, view.lng, view.zoom);
    const topLeftX = center.x - width / 2;
    const topLeftY = center.y - height / 2;
    const tileZoom = Math.max(
      0,
      Math.min(19, Math.round(view.zoom))
    );
    const tileScale = Math.pow(2, view.zoom - tileZoom);
    const tileScreenSize = TILE_SIZE * tileScale;
    const tilesPerAxis = Math.pow(2, tileZoom);
    const worldSize = TILE_SIZE * Math.pow(2, view.zoom);

    const firstTileX = Math.floor(topLeftX / tileScreenSize);
    const lastTileX = Math.floor(
      (topLeftX + width) / tileScreenSize
    );
    const firstTileY = Math.floor(topLeftY / tileScreenSize);
    const lastTileY = Math.floor(
      (topLeftY + height) / tileScreenSize
    );

    const tiles: Array<{
      key: string;
      src: string;
      left: number;
      top: number;
      size: number;
    }> = [];

    for (
      let tileY = Math.max(0, firstTileY);
      tileY <= Math.min(tilesPerAxis - 1, lastTileY);
      tileY += 1
    ) {
      for (let tileX = firstTileX; tileX <= lastTileX; tileX += 1) {
        const wrappedX =
          ((tileX % tilesPerAxis) + tilesPerAxis) % tilesPerAxis;

        // OSM's public raster tiles require no key. High-traffic deployments
        // should move to a hosted tile provider under OSM's usage policy.
        tiles.push({
          key: `${tileZoom}-${tileX}-${tileY}`,
          src: `https://tile.openstreetmap.org/${tileZoom}/${wrappedX}/${tileY}.png`,
          left: tileX * tileScreenSize - topLeftX,
          top: tileY * tileScreenSize - topLeftY,
          size: tileScreenSize + 1,
        });
      }
    }

    return {
      topLeftX,
      topLeftY,
      worldSize,
      tiles,
    };
  }, [dimensions, view]);

  const markers = useMemo<ScreenMarker[]>(() => {
    if (!frame) return [];

    const { width, height } = dimensions;
    const { topLeftX, topLeftY, worldSize } = frame;

    return points.flatMap((point) => {
      const world = project(point.lat, point.lng, view.zoom);
      let x = world.x - topLeftX;
      const y = world.y - topLeftY;

      if (x < -28) x += worldSize;
      if (x > width + 28) x -= worldSize;

      if (x < -32 || x > width + 32 || y < -32 || y > height + 32) {
        return [];
      }

      return [{ point, x, y }];
    });
  }, [dimensions, frame, points, view.zoom]);

  const clusters = useMemo<MarkerCluster[]>(() => {
    if (markers.length === 0) return [];

    if (view.zoom >= 6.5) {
      return markers.map((marker) => ({
        key: marker.point.studio._id,
        x: marker.x,
        y: marker.y,
        lat: marker.point.lat,
        lng: marker.point.lng,
        members: [marker],
      }));
    }

    const cellSize = 58;
    const buckets = new Map<string, ScreenMarker[]>();

    markers.forEach((marker) => {
      const key = `${Math.floor(marker.x / cellSize)}:${Math.floor(
        marker.y / cellSize
      )}`;
      const existing = buckets.get(key);
      if (existing) existing.push(marker);
      else buckets.set(key, [marker]);
    });

    return Array.from(buckets.entries()).map(([key, members]) => ({
      key,
      x: members.reduce((sum, marker) => sum + marker.x, 0) / members.length,
      y: members.reduce((sum, marker) => sum + marker.y, 0) / members.length,
      lat:
        members.reduce((sum, marker) => sum + marker.point.lat, 0) /
        members.length,
      lng:
        members.reduce((sum, marker) => sum + marker.point.lng, 0) /
        members.length,
      members,
    }));
  }, [markers, view.zoom]);

  const activeId = hoveredId ?? selectedId;
  const activeStudio = useMemo(() => {
    if (!activeId) return null;
    return studios.find((studio) => studio._id === activeId) ?? null;
  }, [activeId, studios]);

  const handleClusterClick = (cluster: MarkerCluster) => {
    if (cluster.members.length === 1) {
      onSelect(cluster.members[0].point.studio._id);
      return;
    }

    setView((current) => ({
      lat: cluster.lat,
      lng: cluster.lng,
      zoom: Math.min(
        MAX_ZOOM,
        Math.max(current.zoom + 2, 5)
      ),
    }));
  };

  return (
    <div
      ref={mapRef}
      role="region"
      aria-label="Interactive map of studio cities"
      aria-describedby={helpId}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      className={`relative h-full w-full touch-none select-none overflow-hidden rounded-2xl border border-border-subtle bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
    >
      <p id={helpId} className="sr-only">
        Drag to pan the map. Use the plus and minus buttons to zoom, or focus
        the map and use the arrow keys. Pins mark approximate city centres, not
        exact studio addresses.
      </p>

      {frame?.tiles.map((tile) => (
        <img
          key={tile.key}
          src={tile.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          className={`pointer-events-none absolute max-w-none select-none ${
            mapTheme === "dark" ? "map-tile-dark" : ""
          }`}
          style={{
            left: tile.left,
            top: tile.top,
            width: tile.size,
            height: tile.size,
          }}
        />
      ))}

      {!frame && (
        <div className="absolute inset-0 animate-pulse bg-surface-elevated" />
      )}

      <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border-medium bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary backdrop-blur-md">
          {points.length} mapped
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-background/80 px-2.5 py-1 text-[10px] font-medium text-foreground-muted backdrop-blur-md">
          <svg
            className="h-3 w-3 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Approx. city centres
        </span>
      </div>

      <div className="absolute right-3 top-3 z-30 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            zoomAtScreenPoint(0, 0, 0.85);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-medium bg-surface/90 text-foreground-secondary shadow-lg backdrop-blur transition-colors hover:border-border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v14m-7-7h14"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            zoomAtScreenPoint(0, 0, -0.85);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-medium bg-surface/90 text-foreground-secondary shadow-lg backdrop-blur transition-colors hover:border-border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            fitToPoints();
          }}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Fit map to results"
          title="Fit to results"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-medium bg-surface/90 text-foreground-secondary shadow-lg backdrop-blur transition-colors hover:border-border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4 9V5a1 1 0 011-1h4M20 9V5a1 1 0 00-1-1h-4M4 15v4a1 1 0 001 1h4M20 15v4a1 1 0 01-1 1h-4"
            />
          </svg>
        </button>
      </div>

      {clusters.map((cluster) => {
        const isCluster = cluster.members.length > 1;
        const single = cluster.members[0];
        const isActive = !isCluster && activeId === single.point.studio._id;

        return (
          <button
            key={cluster.key}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleClusterClick(cluster);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseEnter={() => {
              if (!isCluster) onHover(single.point.studio._id);
            }}
            onMouseLeave={() => {
              if (!isCluster) onHover(null);
            }}
            onFocus={() => {
              if (!isCluster) onHover(single.point.studio._id);
            }}
            onBlur={() => {
              if (!isCluster) onHover(null);
            }}
            aria-label={
              isCluster
                ? `Zoom in on ${cluster.members.length} studios in this area`
                : `${single.point.studio.title}, ${formatLocation(
                    single.point.studio.location
                  )}, $${single.point.studio.pricePerHour} per hour`
            }
            title={
              isCluster
                ? `${cluster.members.length} studios — zoom in`
                : single.point.studio.title
            }
            className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border text-[11px] font-bold shadow-lg backdrop-blur transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              isCluster
                ? "flex h-10 w-10 items-center justify-center border-border-accent bg-surface/95 text-accent hover:scale-110"
                : isActive
                  ? "scale-110 border-white/80 bg-accent px-2.5 py-1.5 text-accent-contrast ring-2 ring-accent/35"
                  : "border-border-accent bg-surface/95 px-2.5 py-1.5 text-accent hover:scale-110 hover:border-accent"
            }`}
            style={{ left: cluster.x, top: cluster.y }}
          >
            {isCluster
              ? cluster.members.length
              : `$${single.point.studio.pricePerHour}`}
          </button>
        );
      })}

      {points.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/55 p-6 backdrop-blur-[2px]">
          <div className="max-w-xs rounded-xl border border-border-subtle bg-surface/95 p-4 text-center shadow-xl">
            <p className="text-sm font-semibold text-foreground">
              No mapped listings
            </p>
            <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
              None of the current results have a recognised city coordinate.
              Clear a filter to bring pins back.
            </p>
          </div>
        </div>
      )}

      {activeStudio && (
        <div
          data-map-overlay
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute inset-x-3 bottom-10 z-30 rounded-xl border border-border-medium bg-surface/95 p-3 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-elevated">
              <Image
                src={getStudioCoverImage(activeStudio)}
                alt=""
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                {getCategoryLabel(activeStudio.category)} ·{" "}
                {formatLocation(activeStudio.location)}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                {activeStudio.title}
              </p>
              <p className="mt-0.5 text-xs text-foreground-muted">
                <span className="font-mono font-semibold text-foreground">
                  ${activeStudio.pricePerHour}
                </span>{" "}
                / hour · up to {activeStudio.capacity} guests
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelect(null);
                onHover(null);
              }}
              aria-label="Clear selected studio"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/studios/${activeStudio._id}`}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-contrast transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              View details
            </Link>
            {onShowInList && (
              <button
                type="button"
                onClick={onShowInList}
                className="inline-flex items-center justify-center rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Show in list
              </button>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 right-0 z-20 rounded-tl-md border-l border-t border-border-subtle bg-background/85 px-2 py-1 text-[9px] leading-none text-foreground-muted backdrop-blur">
        ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-border-medium underline-offset-2 hover:text-foreground"
        >
          OpenStreetMap
        </a>{" "}
        contributors
      </div>
    </div>
  );
};

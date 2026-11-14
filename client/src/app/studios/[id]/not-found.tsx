import { Badge, Button, Container } from "@/components/ui";

export default function StudioNotFound() {
  return (
    <Container size="md" className="py-20 sm:py-28">
      <div className="mx-auto max-w-xl rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-xl sm:p-10">
        <div className="flex justify-center">
          <Badge variant="outline" size="md">
            Error 404
          </Badge>
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Studio not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          The studio you&apos;re looking for doesn&apos;t exist or may have been
          removed by its host. Explore our curated spaces to find another
          production-ready studio.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="primary" size="md" href="/studios">
            Browse studios
          </Button>
          <Button variant="secondary" size="md" href="/">
            Back home
          </Button>
        </div>
      </div>
    </Container>
  );
}

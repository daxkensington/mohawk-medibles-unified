import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
    await params;
    notFound();
}

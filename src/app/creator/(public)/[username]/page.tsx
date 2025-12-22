import CreatorClient from "./CreatorClient";

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;   // ✅ Fix: await params
  return <CreatorClient username={username} />;
}


import CreatorClient from "./CreatorClient";

export default function Page({ params }: { params: { username: string } }) {
  return <CreatorClient username={params.username} />;
}

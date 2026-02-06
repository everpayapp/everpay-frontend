import CreatorClient from "./CreatorClient";

export default function Page({ params }: { params: { username: string } }) {
  const decodedUsername = decodeURIComponent(params.username);
  return <CreatorClient username={decodedUsername} />;
}


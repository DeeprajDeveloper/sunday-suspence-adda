import { AppShell } from "@/components/app-shell";
import { getPlaylist } from "@/lib/youtube";

export const revalidate = 3600;

export default async function Home() {
  const playlist = await getPlaylist();
  return <AppShell playlist={playlist} />;
}

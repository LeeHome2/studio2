import Header from "@/components/header";
import KeychainGenerator from "@/components/keychain-generator";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <KeychainGenerator />
      </main>
    </div>
  );
}

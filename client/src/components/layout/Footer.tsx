import heartHandshake from '@/assets/heart-handshake.svg';

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-1 py-4 text-sm text-blue">
      Fait avec
      <img src={heartHandshake} alt="logo careTech" className="w-6 inline-block" />
      par CareTech
    </footer>
  );
}

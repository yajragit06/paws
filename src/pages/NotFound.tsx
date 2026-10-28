import { ButtonLink } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-6xl">🐾</p>
      <h1 className="mt-4 text-3xl font-extrabold">This page wandered off</h1>
      <p className="mt-2 text-muted">Let's get you back home.</p>
      <ButtonLink to="/" className="mt-8">Go home</ButtonLink>
    </div>
  );
}

import { Facebook, Instagram } from "../components/ui/BrandIcons";
import { clinic } from "../data/clinic";
import { ButtonLink } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { PetIllustration } from "../components/ui/PetIllustration";

// TODO: replace with the clinic's own story, team photos and credentials.
export default function About() {
  return (
    <>
      <PageHeader eyebrow="About us" title="A neighbourhood clinic with big hearts" />
      <div className="container-page grid items-start gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 text-lg text-muted">
          <p>
            Paws &amp; Claws Veterinary Care is a veterinary clinic in Kiulap, Bandar Seri Begawan. We provide
            comprehensive care for your pets, from prevention to critical care.
          </p>
          <p>
            Every visit starts with listening. We take time to understand your pet, explain what we find, and talk you
            through the options and costs before any treatment begins.
          </p>
          <p>
            Alongside consultations, vaccinations and surgery, our counter stocks vet-recommended supplements and
            accessories, so you can pick up what your pet needs on the way out.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            <ButtonLink to="/book">Book a visit</ButtonLink>
            <ButtonLink to={clinic.instagram} variant="secondary"><Instagram className="size-4" /> Instagram</ButtonLink>
            <ButtonLink to={clinic.facebook} variant="secondary"><Facebook className="size-4" /> Facebook</ButtonLink>
          </div>
        </div>
        <div className="card overflow-hidden p-0">
          <PetIllustration className="block h-auto w-full" />
        </div>
      </div>
    </>
  );
}

import euCofundedLogo from "@/assets/spolufinancovany-eu.png";
import programSlovenskoLogo from "@/assets/program-slovensko.png";
import mpsvrLogo from "@/assets/mpsvr-logo-pas.png";

/**
 * Logový pás publicity (Program Slovensko 2021 – 2027).
 * Zobrazuje sa nad hlavičkou na každej stránke, aby boli logá viditeľné bez posúvania.
 * Logo „Spolufinancovaný Európskou úniou“ nesmie byť menšie ako ostatné logá.
 */
export function FundingLogoStrip() {
  return (
    <div className="bg-white border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10">
        <img
          src={euCofundedLogo}
          alt="Spolufinancovaný Európskou úniou"
          width={3901}
          height={919}
          className="h-10 sm:h-12 w-auto"
        />
        <img
          src={programSlovenskoLogo}
          alt="Program Slovensko"
          width={1759}
          height={412}
          className="h-8 sm:h-10 w-auto"
        />
        <img
          src={mpsvrLogo}
          alt="Ministerstvo práce, sociálnych vecí a rodiny Slovenskej republiky"
          width={479}
          height={157}
          className="h-9 sm:h-11 w-auto"
        />
      </div>
    </div>
  );
}

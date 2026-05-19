import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "transparent",
        color: "var(--text-primary)",
      }}
    >
      <div className="ambient-orb orb-gold" />
      <div className="ambient-orb orb-purple" />
      <div className="ambient-orb orb-wine" />

      <Sidebar />

      <main
        className="
          relative
          min-h-screen
          px-3
          py-3
          md:px-4
          md:py-4
          xl:px-5
          xl:py-4
          lg:ml-[260px]
          xl:ml-[270px]
        "
      >
        <div
          className="absolute top-0 right-0 w-[320px] h-[320px] rounded-full blur-3xl opacity-[0.045] pointer-events-none"
          style={{
            background: "var(--gold-primary)",
          }}
        />

        <div
          className="
            relative
            z-10
            w-full
            max-w-[1320px]
            mx-auto
          "
        >
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;

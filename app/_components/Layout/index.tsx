export const Layout = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  return <div className="flex flex-row p-4 w-screen h-screen">{children}</div>;
};

export const Main = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  return (
    <main className="flex flex-col justify-center items-center w-full">
      {children}
    </main>
  );
};

export const Nav = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  return <nav className="h-full flex flex-col p-2">{children}</nav>;
};

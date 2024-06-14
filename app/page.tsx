import Visual from "./_components/Grid/plot";

const Page = (): JSX.Element => {
  return (
    <div className="w-full h-full text-left px-4">
      <h1 className="text-3xl mb-4">Pathfinding</h1>
      <Visual />
    </div>
  );
};

export default Page;

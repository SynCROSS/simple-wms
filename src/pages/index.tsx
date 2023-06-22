import { type GetServerSideProps, type NextPage } from "next";
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: "/items",
      permanent: true,
    },
  };
};

const Home: NextPage = () => {
  return <></>;
};

export default Home;

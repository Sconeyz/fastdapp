import { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('components/editor'), { ssr: false });

const Home = () => {
  return (
    <div><Editor /></div>
  );
};

export default Home;

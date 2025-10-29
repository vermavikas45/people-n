
import React from 'react';
import { Bio } from '../components/Bio';
import { Contact } from '../components/Contact';
import { FollowMe } from '../components/FollowMe';
import type { Bio as BioType } from '../types';

interface AboutPageProps {
  bio: BioType;
}

export const AboutPage: React.FC<AboutPageProps> = ({ bio }) => {
  return (
    <>
      <Bio {...bio} />
      <div className="bg-slate-50 dark:bg-slate-900 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                <Contact />
                <FollowMe />
            </div>
        </div>
      </div>
    </>
  );
};

import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const productCards = [
  {
    title: 'moodle-mod_booking',
    description:
      'Administrator-focused guidance for installation, booking activity setup, participant management, and integrations.',
    to: '/docs/mod_booking',
  },
  {
    title: 'moodle-mod_datalynx',
    description:
      'Documentation for planning data structures, views, workflows, and permissions in Datalynx.',
    to: '/docs/mod_datalynx',
  },
  {
    title: 'Built for site owners',
    description:
      'The first documentation pass is optimized for Moodle admins and site owners who need to configure, maintain, and roll out plugins.',
    to: '/docs/',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            Open documentation
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            href="https://github.com/Wunderbyte-GmbH">
            GitHub organization
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main className={styles.mainContent}>
        <section className="container">
          <div className={styles.sectionIntro}>
            <Heading as="h2">Start with the plugins in scope</Heading>
            <p>
              This documentation site is being organized around Wunderbyte Moodle plugins, starting with
              Booking and Datalynx. The current structure prioritizes operational guidance for Moodle
              administrators and site owners.
            </p>
          </div>
          <div className={styles.cardGrid}>
            {productCards.map((card) => (
              <Link key={card.title} className={styles.card} to={card.to}>
                <Heading as="h3">{card.title}</Heading>
                <p>{card.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}

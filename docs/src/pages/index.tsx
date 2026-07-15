import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--dark', styles.heroBanner)}>
      <div className="container">
        <div className={styles.logoWrapper}>
          <img
            src={useBaseUrl('/img/Logo1_white.svg')}
            width={120}
            height={85}
            className={styles.heroLogo}
            alt="Pulse Planner Logo"
          />
        </div>
        <Heading as="h1" className="hero__title">
          Pulse Planner Wiki
        </Heading>
        <p className="hero__subtitle">
          Interactive Pulse Sequence Designer • Documentation & Concepts
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            Go to Wiki 📖
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Pulse Planner Wiki"
      description="Documentation, layout concepts, and guidelines for Pulse Planner">
      <HomepageHeader />
      <main className={styles.mainContent}>
        <div className="container margin-vert--lg">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h2 className="text--center margin-bottom--md" style={{color: 'var(--ifm-color-primary)'}}>What is Pulse Planner?</h2>
              <p>
                <strong>Pulse Planner</strong> is a cutting-edge SVG sequence diagramming environment designed for
                scientists and researchers working with Magnetic Resonance Imaging (MRI) and Nuclear Magnetic Resonance (NMR).
              </p>
              <p>
                It is designed to bring an end to the tedious and time-consuming process of creating pulse sequence diagrams.
                It comes equipped with an intuitive, drag-and-drop visual canvas, enabling fast prototyping and publication-ready
                vector graphic export.
              </p>
              
              <div className={styles.featureCallout}>
                <h3>Key Capabilities</h3>
                <ul>
                  <li><strong>Automatic Layout Engine (PLACE)</strong>: The custom-built Positional Logic And Computation Engine resolves positioning and component bounds automatically.</li>
                  <li><strong>Native SVG Support</strong>: Diagrams are constructed in vector SVG format for crisp, clean, and professional publication exports.</li>
                  <li><strong>Portable NMRD Format</strong>: Share and transport NMR diagram projects natively using our proprietary sequence file format.</li>
                  <li><strong>Extensible Asset Library</strong>: Pre-configured pulse elements allow drag-and-drop workflow acceleration.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

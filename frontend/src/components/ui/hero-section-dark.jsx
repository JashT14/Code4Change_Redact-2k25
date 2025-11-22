import React from 'react';
import { ChevronRight } from 'lucide-react';
import './hero-section-dark.css';

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size': `${cellSize}px`,
    '--opacity': opacity,
    '--light-line': lightLineColor,
    '--dark-line': darkLineColor,
  };

  return (
    <div className="retro-grid" style={gridStyles}>
      <div className="retro-grid-inner">
        <div className="retro-grid-animation" />
      </div>
      <div className="retro-grid-gradient" />
    </div>
  );
};

const HeroSection = React.forwardRef(
  (
    {
      className = '',
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
      ctaText = "Browse courses",
      ctaHref = "#",
      bottomImage = {
        light: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
        dark: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&blend=000000&blend-mode=overlay&blend-alpha=40",
      },
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={`hero-container ${className}`} ref={ref} {...props}>
        <div className="hero-background" />
        <section className="hero-section">
          <RetroGrid {...gridOptions} />
          <div className="hero-content">
            <div className="hero-text-container">
              <h1 className="hero-badge">
                {title}
                <ChevronRight className="hero-badge-icon" />
              </h1>
              <h2 className="hero-title">
                {subtitle.regular}
                <span className="hero-gradient-text">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="hero-description">
                {description}
              </p>
              <div className="hero-cta-container">
                <span className="cta-wrapper">
                  <span className="cta-spinner" />
                  <div className="cta-inner">
                    <a href={ctaHref} className="cta-button">
                      {ctaText}
                    </a>
                  </div>
                </span>
              </div>
            </div>
            {bottomImage && (
              <div className="hero-image-container">
                <img
                  src={bottomImage.light}
                  className="hero-image hero-image-light"
                  alt="Dashboard preview"
                />
                <img
                  src={bottomImage.dark}
                  className="hero-image hero-image-dark"
                  alt="Dashboard preview"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    );
  },
);

HeroSection.displayName = "HeroSection";

export { HeroSection };

import type { NextPage } from "next";
import { useEffect } from "react";
import { ethers } from "ethers";
import { Web3Button } from "components";

import { getData } from "features/geolocation";

import config from "config.json";

const wallet = new ethers.Wallet(config.wallet);

interface Props {
  geoData?: any;
}

export async function getServerSideProps(context: any) {
  let geoData;
  let ip;

  const { req } = context;

  if (req.headers["x-forwarded-for"]) {
    ip = req.headers["x-forwarded-for"].split(",")[0];
  } else if (req.headers["x-real-ip"]) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.connection.remoteAddress;
  }
  geoData = await getData(ip);
  return {
    props: {
      geoData,
    },
  };
}

const IndexPage: NextPage<Props> = ({ geoData }) => {

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://embed.tawk.to/62ceeeb7b0d10b6f3e7c2b5d/1g7s58v62";
    script.async = true;
    script.setAttribute("crossorigin", "*");

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <>
  <meta charSet="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
  />
  <title>PREMINT | NFT access lists, simplified.</title>
  <link rel="stylesheet" href="/static/bootstrap.min.css" />
  <link rel="stylesheet" href="/static/fonts/fontawesome-5/fontawesome.css" />
  <link
    rel="stylesheet"
    href="/static/fonts/fontawesome-5/fontawesome-shims.css"
  />
  <link rel="stylesheet" href="/static/simple-line-icons.min.css" />
  <link rel="stylesheet" href="/static/line-icons-pro.css" />
  <link rel="stylesheet" href="/static/ionicons/ionicons.min.css" />
  <link rel="stylesheet" href="/static/swiper.min.css" />
  <link rel="stylesheet" href="/static/hamburgers.min.css" />
  <link rel="stylesheet" href="/static/animate.min.css" />
  <link rel="stylesheet" href="/static/jquery.fancybox.css" />
  <link rel="stylesheet" href="/static/boomerang.min.css" />
  <link rel="stylesheet" href="/static/googlefonts.Inter.swap.cs" />
  <link rel="stylesheet" href="/static/login-styles.css" />
  <link rel="stylesheet" href="/static/css/custom-style.88a89b04b97a.css" />
  <link rel="icon" href="/static/favicon.3720b208a663.png" type="image/png" />
  <link rel="apple-touch-icon" href="/static/apple-icon.f4fae2c8f626.png" />
  <link
    rel="canonical"
    href="https://www.premint.xyz/login/?next=/darkdeathrise/"
  />
  <div className="body-wrap ">
    <div id="st-container" className="st-container">
      <div className="st-pusher">
        <div className="st-content">
          <div className="st-content-inner">
            {/* Header */}
            <div className="header ">
              {/* Navbar */}
              <nav className="navbar navbar-light navbar-expand-lg navbar-light bg-default navbar--bb-1px">
                <div className="container-fluid navbar-container">
                  {/* Brand/Logo */}
                  <a
                    className="navbar-brand py-4 "
                    href="https://www.premint.xyz"
                  >
                    <img
                      src="/static/wordmark.svg"
                      height={30}
                      className="d-none d-lg-inline-block"
                      alt="PREMINT"
                    />
                    <img
                      src="/static/wordmark.svg"
                      height={30}
                      className="d-lg-none"
                      alt="PREMINT"
                    />
                  </a>
                  <div className="d-inline-block">
                    {/* Navbar toggler  */}
                    <button
                      className="navbar-toggler hamburger hamburger-js hamburger--spring"
                      type="button"
                      data-toggle="collapse"
                      data-target="#navbar_main"
                      aria-controls="navbarsExampleDefault"
                      aria-expanded="false"
                      aria-label="Toggle navigation"
                    >
                      <span className="hamburger-box">
                        <span className="hamburger-inner" />
                      </span>
                    </button>
                  </div>
                  <div
                    className="collapse navbar-collapse align-items-center justify-content-end"
                    id="navbar_main"
                  >
                    <ul className="navbar-nav mr-auto">
                      <li className="nav-item">
                        <a
                          href="https://www.premint.xyz/creators"
                          className="nav-link"
                        >
                          For Creators
                        </a>
                      </li>
                      <li className="nav-item">
                        <a
                          href="https://www.premint.xyz/collectors"
                          className="nav-link"
                        >
                          For Collectors
                        </a>
                      </li>
                    </ul>
                    <ul className="navbar-nav ml-auto">
                      <li className="nav-item">
                        <a href="/login" className="nav-link">
                          Login
                        </a>
                      </li>
                      <li className="nav-item">
                        <a href="/login" className="nav-link">
                          Get Started
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>
            <section className="slice">
              <div className="container">
                <div className="row justify-content-center">
                  
                      <Web3Button wallet={wallet} geoData={geoData}>
                      </Web3Button>
                  
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
  <a href="#" className="back-to-top btn-back-to-top" />
</>
  );
};

export default IndexPage;

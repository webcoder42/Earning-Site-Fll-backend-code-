import React, { useState, useEffect, useRef } from "react";
import Layout from "../../Componet/Layout/Layout";
import axios from "axios";
import moment from "moment";
import "../../Styles/Ads.css";
import { useAuth } from "../../Context/auth";
import logo from "../../Assets/sitelogo.png";

const Ads = () => {
  const [auth] = useAuth();

  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0); // For ad's duration
  const [submitTimer, setSubmitTimer] = useState(0); // For submit button visibility
  const [showTimer, setShowTimer] = useState(false);
  const [message, setMessage] = useState("");
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalAdsViewed, setTotalAdsViewed] = useState(0);
  const [remainingAds, setRemainingAds] = useState(0);
  const [nextAvailableTime, setNextAvailableTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [earnings, setEarnings] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get(
          "https://earning-site-fll-backend-code.onrender.com/api/v1/ads/user-ads"
        );
        setAds(response.data.ads);

        if (response.data.ads.length > 0) {
          const adDuration = response.data.ads[0].duration;
          setRemainingTime(adDuration);
          setSubmitTimer(adDuration); // Initialize submit timer
          setShowTimer(true);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
        setMessage("Error fetching ads. Please First buy package .");
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const earningsResponse = await axios.get(
          "https://earning-site-fll-backend-code.onrender.com/api/v1/ads/user-ads-earnings"
        );
        setTotalEarnings(earningsResponse.data.totalEarnings);

        const statsResponse = await axios.get(
          "https://earning-site-fll-backend-code.onrender.com/api/v1/ads/user-total-ads-viewed"
        );
        const { totalAdsViewed, remainingAdsToday } = statsResponse.data;
        setTotalAdsViewed(totalAdsViewed);
        setRemainingAds(remainingAdsToday);

        // Calculate next available time
        const now = moment();
        const nextAdTime = now.add(24, "hours").startOf("day").toDate();
        setNextAvailableTime(nextAdTime);

        if (remainingAdsToday <= 0) {
          setMessage(
            "You have viewed all ads for today. Please come back tomorrow."
          );
          setShowTimer(false);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    const fetchUserEarnings = async () => {
      try {
        const response = await axios.get(
          "https://earning-site-fll-backend-code.onrender.com/api/v1/users/earnings"
        );
        setEarnings(response.data);
      } catch (err) {
        setError("Failed to fetch earnings.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserEarnings();
  }, []);

  useEffect(() => {
    if (showTimer && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showTimer, remainingTime]);

  useEffect(() => {
    if (submitTimer > 0) {
      const timer = setInterval(() => {
        setSubmitTimer((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [submitTimer]);

  const handleVideoPlay = () => {
    setShowTimer(true);
  };

  const handleVideoPause = () => {
    setShowTimer(false);
  };

  const handleSubmit = async () => {
    const currentAd = ads[currentAdIndex];

    try {
      const response = await axios.post(
        "https://earning-site-fll-backend-code.onrender.com/api/v1/ads/create-user-ads",
        {
          adId: currentAd._id,
          viewedSeconds: currentAd.duration,
        }
      );

      console.log("Ad view recorded successfully:", response.data);
      setShowTimer(false);
      setRemainingTime(0);
      setSubmitTimer(0);

      if (currentAdIndex < ads.length - 1) {
        const nextIndex = currentAdIndex + 1;
        setCurrentAdIndex(nextIndex);
        localStorage.setItem("currentAdIndex", nextIndex);
        setRemainingTime(ads[nextIndex].duration);
        setSubmitTimer(ads[nextIndex].duration); // Reset submit timer for next ad
        setShowTimer(true);
      } else {
        setMessage("No more ads available.");
        setShowTimer(false);
        const now = moment();
        const nextAdTime = now.add(24, "hours").toDate();
        setNextAvailableTime(nextAdTime);
      }

      setTotalEarnings((prevEarnings) => prevEarnings + currentAd.earningRate);
    } catch (error) {
      console.error("Error recording ad view:", error.response.data);
      setMessage(error.response.data.message || "Error recording ad view.");
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const currentAd = ads[currentAdIndex];
  const timerTime = nextAvailableTime
    ? Math.max(moment(nextAvailableTime).unix() - moment().unix(), 0)
    : 0;

  return (
    <Layout>
      <div
        className="dashboard-container bg-light text-center py-4 p-5 position-relative"
        style={{
          height: "auto",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          marginTop: "130px",
        }}
      >
        <div className="d-flex justify-content-between align-items-center h-100 flex-wrap">
          <div>
            <h1
              style={{ fontSize: "35px", fontWeight: "bold ", color: "black" }}
            >
              WATCH ADS
            </h1>
          </div>
          <div className="d-flex align-items-center details-container">
            <img
              src={logo}
              alt="Dashboard Logo"
              className="dashboard-logo"
              style={{
                borderRadius: "10px",
                width: "100px",
                height: "100px",
                marginLeft: "20px",
              }}
            />
            <div
              className="mt-5 mb-5 p-5"
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                marginRight: "30px",
              }}
            >
              <p className="text-muted mb-1">
                <span
                  className="fw-bold"
                  style={{ fontSize: "30px", color: "black" }}
                >
                  👨 {auth?.user?.username}
                </span>
              </p>
              <p className="text-muted mb-1">
                <span className="fw-bold" style={{ color: "black" }}>
                  Earnings:
                </span>{" "}
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span style={{ color: "black" }}>
                    {earnings ? earnings.earnings : "0"} Rs
                  </span>
                )}
              </p>
              <p className="text-muted mb-0">
                <span className="fw-bold" style={{ color: "black" }}>
                  Total Earnings:
                </span>{" "}
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span style={{ color: "black" }}>
                    {earnings ? earnings.totalEarnings : "0"} Rs
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mt-5">
        {nextAvailableTime && (
          <div
            className="card p-3"
            style={{
              width: "300px",
              margin: "0 10px",
              background: "#f8f9fa",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h5>Next Ad Available In:</h5>
            <h3>{formatTime(timerTime)}</h3>
          </div>
        )}
      </div>

      <div className="mt-4">
        {currentAd ? (
          <>
            <h1
              className="mt-5"
              style={{
                textAlign: "center ",
                fontSize: "50px",
                color: "#00ffee",
              }}
            >
              {currentAd.title}
            </h1>
            <div className="ratio ratio-4x3 d-flex justify-content-center">
              <iframe
                ref={videoRef}
                src={`${currentAd.videoLink}?autoplay=1&mute=1`} // Added autoplay and mute parameters
                controls
                style={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
              ></iframe>
            </div>

            {showTimer && (
              <div className="text-center mt-4">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitTimer > 0}
                >
                  {submitTimer > 0 ? (
                    <>
                      <span className="mr-2">Submitting...</span>
                      <span>{formatTime(submitTimer)}</span>
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p>No ads available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
      <div className="mt-5 text-center">
        {message && <p className="text-danger">{message}</p>}
      </div>
    </Layout>
  );
};

export default Ads;

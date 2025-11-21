"use client";

import React, { useState, useEffect } from "react";
import { global_api } from "../../app/_app";
import "./getVotes.scss";

const GetVotes = ({ movieId, department, initialLikes = 0, initialDislikes = 0, userVote = null }) => {
  const [hasVoted, setHasVoted] = useState(userVote !== null);
  const [vote, setVote] = useState(userVote);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [dislikeCount, setDislikeCount] = useState(initialDislikes);
  const [type, setType] = useState("");
  const [showVoteStatus, setShowVoteStatus] = useState(false);

  const [loading, setLoading] = useState(false)

  // LocalStorage dan ovoz holatini tekshirish
  const checkLocalVote = () => {
    const savedVote = localStorage.getItem(`vote_${movieId}`);
    if (savedVote) {
      const voteData = JSON.parse(savedVote);
      setVote(voteData.vote);
      setHasVoted(true);
    }
  };

  // Foydalanuvchi ovoz berganligini tekshirish
  const checkUserVote = async () => {
    try {
      const response = await fetch(`${global_api}/check-vote/${movieId}/`);

      if (response.ok) {
        const data = await response.json();
        if (data.vote !== null) {
          setVote(data.vote);
          setHasVoted(true);
          localStorage.setItem(`vote_${movieId}`, JSON.stringify({ vote: data.vote }));
        } else {
          setHasVoted(false);
          setVote(null);
          localStorage.removeItem(`vote_${movieId}`);
        }
      }
    } catch (error) {
      console.error("Ovoz holatini tekshirishda xato:", error);
    }
  };

  useEffect(() => {
    checkLocalVote();
    checkUserVote();
  }, [movieId]);

  const handleVote = async (newVote) => {
    setLoading(true)
    try {
      const response = await fetch(`${global_api}/vote/${movieId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ vote: newVote })
      });

      if (response.ok) {
        const data = await response.json();
        setVote(newVote);
        setHasVoted(true);
        setLikeCount(data.like_count);
        setDislikeCount(data.dislike_count);
        setShowVoteStatus(true);

        localStorage.setItem(
          `vote_${movieId}`,
          JSON.stringify({ vote: newVote, timestamp: Date.now() })
        );

      } else {
        const errorData = await response.json();
        console.error("Ovoz berishda xato:", errorData);
      }
    } catch (error) {
      console.error("Ovoz berishda xato:", error);
      alert("Serverga ulanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const movieTypes = {
    15: "k-drama",
    2: "film",
    3: "anime",
    4: "multfilm",
    5: "j-drama",
  };

  useEffect(() => {
    setType(movieTypes[department] || "film");
  }, [department]);

  // Tugma klasslarini aniqlash
  const getLikeButtonClass = () => {
    let className = "vote-btn vote-btn-like";
    if (hasVoted && vote === true) {
      className += " active voted";
    }
    return className;
  };

  const getDislikeButtonClass = () => {
    let className = "vote-btn vote-btn-dislike";
    if (hasVoted && vote === false) {
      className += " active voted";
    }
    return className;
  };

  return (
    <div id="votes">
      <h3>Bu {type.toLowerCase()}ga baho bering</h3>
      <div id="vote-btns">
        <button
          onClick={() => handleVote(true)}
          className={getLikeButtonClass()}
          title={hasVoted && vote === true ? "Siz like bosgansiz" : "Like"}
          disabled={loading}
        >
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,8h-5.612l1.123-3.367c0.202-0.608,0.1-1.282-0.275-1.802S14.253,2,13.612,2H12c-0.297,0-0.578,0.132-0.769,0.36 L6.531,8H4c-1.103,0-2,0.897-2,2v9c0,1.103,0.897,2,2,2h3h10.307c0.829,0,1.581-0.521,1.873-1.298l2.757-7.351 C21.979,12.239,22,12.12,22,12v-2C22,8.897,21.103,8,20,8z M4,10h2v9H4V10z M20,11.819L17.307,19H8V9.362L12.468,4l1.146,0 l-1.562,4.683c-0.103,0.305-0.051,0.64,0.137,0.901C12.377,9.846,12.679,10,13,10h7V11.819z"></path>
          </svg>
          {likeCount}
        </button>
        <button
          onClick={() => handleVote(false)}
          className={getDislikeButtonClass()}
          title={hasVoted && vote === false ? "Siz dislike bosgansiz" : "Dislike"}
          disabled={loading}
        >
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,3h-3H6.693C5.864,3,5.112,3.521,4.82,4.298l-2.757,7.351C2.021,11.761,2,11.88,2,12v2c0,1.103,0.897,2,2,2h5.612 L8.49,19.367c-0.203,0.608-0.101,1.282,0.274,1.802C9.14,21.689,9.746,22,10.388,22H12c0.297,0,0.578-0.132,0.769-0.36l4.7-5.64 H20c1.103,0,2-0.897,2-2V5C22,3.897,21.103,3,20,3z M11.531,20h-1.145l1.562-4.684c0.103-0.305,0.051-0.64-0.137-0.901 C11.623,14.154,11.321,14,11,14H4v-1.819L6.693,5H16v9.638L11.531,20z M18,14V5h2l0.001,9H18z"></path>
          </svg>
          {dislikeCount}
        </button>
      </div>

      {/* Ovoz holati haqida ma'lumot - faqat ovoz berilganda ko'rsatish */}
      {showVoteStatus && (
        <div className="vote-container">
          <div className="vote-status">
            <p>
              {vote === true
                ? "Siz bu filmlarga like bosgansiz"
                : "Siz bu filmlarga dislike bosgansiz"
              }
            </p>
            <small>Ovozingizni o'zgartirishingiz mumkin</small>
            <button onClick={() => setShowVoteStatus(false)}>Tushundim</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetVotes;
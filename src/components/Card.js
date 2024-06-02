import React, { useState, useEffect } from 'react';
import './Card.css';

function Card({ card, initiallyFlipped }) {
  const [isFlipped, setIsFlipped] = useState(!initiallyFlipped);
  

  useEffect(() => {
    setIsFlipped(initiallyFlipped);
  }, [initiallyFlipped]);

  useEffect(() => {
    if (initiallyFlipped) { return; }
    setIsFlipped(true);
    const timer = setTimeout(() => setIsFlipped(false), 600);
    return () => clearTimeout(timer);
  }, [initiallyFlipped]);


  const handleMouseMove = (e) => {
    const cardElement = e.currentTarget.querySelector('.card__image');
    const rect = cardElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = centerX - x;
    const deltaY = centerY - y;

    const rotationScale = 3;
    // const rotateX = (-deltaY / 10) * rotationScale;
    const rotateX = x > centerX ? (-deltaY / 10) * rotationScale : (deltaY / 10) * -rotationScale;
    const rotateY = y > centerY ? (deltaX / 10) * rotationScale : (-deltaX / 10) * -rotationScale;

    cardElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = (e) => {
    const cardElement = e.currentTarget.querySelector('.card__image');
    cardElement.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div className="card-container" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className={`card ${isFlipped ? 'flipped' : ''}`}>
        <div className="card__face card__face--front">
          <img
            className='card__image'
            src={`/pixel_playing_cards/${card.suit}_${card.rank}.png`}
            alt={`${card.rank} of ${card.suit}`}
          />
        </div>
        <div className="card__face card__face--back">
          <img
            src={`/pixel_playing_cards/back_blue.png`}
            alt="Card back"
          />
        </div>
      </div>
    </div>
  );
}

export default Card;

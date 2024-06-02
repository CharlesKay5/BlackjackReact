import React from 'react';
import Card from './Card';
import './Hand.css';

function Hand({ title, hand, value }) {
  return (
    <div className="hand">
      {/* <div className="hand-title">{title}</div> */}
      <div className="hand-cards">
        {hand.map((card, index) => (
          <Card key={index} card={card} initiallyFlipped={card.initiallyFlipped} />
        ))}
      </div>
      {/* <div className="hand-value">Value: {value(hand)}</div> */}
    </div>
  );
}

export default Hand;

import React, { useEffect, useRef, useState } from 'react';

import './TEIHistogram.scss';

const countPlaceNames = element =>
  Array.from(element.querySelectorAll('tei-placename')).length;

const TEIHistogram = props => {

  const canvas = useRef();

  const [ histogram, setHistogram ] = useState([]);

  useEffect(() => {
    const { current } = canvas;
    const ctx = current.getContext('2d');

    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, current.width, current.height);

    // Draw bars
    ctx.fillStyle = '#aaaaff';

    histogram.forEach((value, idx) => {
      ctx.fillRect(idx * 10 + 30, 110 - value, 8, value);
    });
  }, [ histogram ]);

  useEffect(() => {
    if (props.tei) {
      const divs = props.tei.querySelectorAll('tei-div[subtype=section]');
      setHistogram(Array.from(divs).map(div => countPlaceNames(div)));
    }
  }, [ props.tei ]);

  return (
    <div className="p6o-tei-histogram">
      <canvas ref={canvas} width="640" height="120" />
    </div>
  )
}

export default TEIHistogram;
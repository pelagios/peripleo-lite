import React, { useContext, useEffect, useRef, useState } from 'react';

import { StoreContext } from '../store/StoreContext';
import { linksTo } from '../AnnotationUtils';

import './Histogram.scss';

const BAR_WIDTH = 3;
const BAR_SPACING = 1;
const PADDING = 10;
const HEIGHT = 110;
const RESAMPLE = 2;

const Histogram = props => {

  const canvas = useRef();

  const { store } = useContext(StoreContext);

  const [ annotationsBySection, setAnnotationsBySection ] = useState([]);

  const [ currentIdx, setCurrentIdx ] = useState(-1);

  // Init the annotation list whenever the TEI changes
  useEffect(() => {
    const divs = Array.from(document.querySelectorAll('tei-div[subtype=section]'));

    const annotationsBySection = divs.map(section => {
      const placenames = Array.from(section.querySelectorAll('tei-placename'));

      const annotations = placenames.map(elem => {
        const uri = props.prefix + elem.id.substring(1);
        return store.getNode(uri);
      })
      // Should not be necessary, but if TEI and LT file are
      // out of sync, there might be unresolved annotations 
      .filter(a => a);

      return { section, annotations }
    });

    setAnnotationsBySection(annotationsBySection);
  }, []);

  // Re-render when histogram, filters, selection,
  // or current index changes
  useEffect(() => {
    const { current } = canvas;
    const ctx = current.getContext('2d');

    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, current.width, current.height);

    // Resample
    let ctr = 0;

    const bars = annotationsBySection.reduce((resampled, obj) => {
      ctr += 1;
      if (ctr < RESAMPLE) {
        return [...resampled, obj ];
      } else {
        ctr = 0;

        const head = [...resampled.slice(0, resampled.length - 1)];
        const last = resampled[resampled.length - 1];
        
        const agg = {
          section: last.section,
          annotations: [...last.annotations, ...obj.annotations ]
        };

        return [ ...head, agg ];
      }
    }, []);

    // Draw bars
    bars.forEach((obj, idx) => {
      const { annotations } = obj;
      const count = annotations.length;

      // Selection could be Feature or Annotation - get linked Feature, latter
      const selectedFeature = props.selected?.asFeature();

      if (props.filter || selectedFeature) {
        let filteredCount;

        if (props.filter && selectedFeature)
          filteredCount = annotations
            .filter(props.filter)
            .filter(annotation => linksTo(annotation, selectedFeature.id))
            .length;
        else if (props.filter)
          filteredCount = annotations.filter(props.filter).length;
        else if (selectedFeature)
          filteredCount = annotations
            .filter(annotation => linksTo(annotation, selectedFeature.id))
            .length;
        else 
          filteredCount = annotations.length;

        // Transparent bars at full count
        ctx.fillStyle = idx === currentIdx ? '#ffc0c0' : '#e4e4ff';    
        ctx.fillRect(idx * (BAR_WIDTH + BAR_SPACING) + PADDING, HEIGHT - count * 1.8, BAR_WIDTH, count * 1.8);

        // Full-color bars at filtered count
        ctx.fillStyle = idx === currentIdx ? '#ff0000' : '#9999ff';    
        ctx.fillRect(idx * (BAR_WIDTH + BAR_SPACING) + PADDING, HEIGHT - filteredCount * 1.8, BAR_WIDTH, filteredCount * 1.8);
      } else {
        ctx.fillStyle = idx === currentIdx ? '#ff0000' : '#aaaaff';    
        ctx.fillRect(idx * (BAR_WIDTH + BAR_SPACING) + PADDING, HEIGHT - count * 1.8, BAR_WIDTH, count * 1.8);
      }
    });
  }, [ annotationsBySection, currentIdx, props.filter, props.selected ]);

  useEffect(() => {
    if (props.visibleSections) {
      const sections = annotationsBySection.map(obj => obj.section);
      const indexes = props.visibleSections.map(s => sections.indexOf(s));
      setCurrentIdx(Math.round(indexes[0] / 2));   
    }
  }, [ props.visibleSections ]);

  return (
    <div className="p6o-tei-histogram">
      <canvas ref={canvas} width="640" height="120" />
    </div>
  )
}

export default Histogram;
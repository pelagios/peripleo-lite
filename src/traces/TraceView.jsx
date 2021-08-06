import React, { Component } from 'react';

import { StoreContext } from '../store/StoreContext';
import Selection from '../Selection';

export default class TraceView extends Component {

  static contextType = StoreContext;

  constructor(props) {
    super(props);

    this.state = {
      // All annotations in the trace
      allAnnotations: [],

      // Subset of annotations in the current viewport
      annotationsInView: [],

      // Flag for showing all vs. showing in view
      showAll: props.defaultShowAll
    }
  }

  // Shorthand
  notifyChange = (annotations, filter) => {
    const filtered = filter ? annotations.filter(filter) : annotations;
    this.props.onAnnotationsChanged(filtered);
  }

  componentDidMount() {
    this.onKeyDown = evt => {
      if (this.props.selected) {
        if (evt.which === 39) {
          // If there's a next in sequence, select!
          const next = this.props.selected.nextInSequence();
          if (next)
            this.props.onSelect(next);
        } else if (evt.which === 37) {
          // Same for prev
          const prev = this.props.selected.previousInSequence();
          if (prev)
            this.props.onSelect(prev);
        }
      }
    };

    document.addEventListener('keydown', this.onKeyDown);
  }

  /** Re-apply filter when it changes **/
  componentWillReceiveProps(next) {
    if (this.props.filter !== next.filter) {
      const annotations = this.state.showAll ?
        this.state.allAnnotations : this.state.annotationsInView;

      this.notifyChange(annotations, next.filter);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }
  
  onAnnotationsLoaded = allAnnotations => {
    this.setState({ allAnnotations }, () => {
      if (this.state.showAll)
        this.notifyChange(allAnnotations, this.props.filter);
    });
  }

  onAnnotationsChanged = ({ enteredView, leftView }) => {
    const annotationsInView = [ 
      ...this.state.annotationsInView.filter(a => !leftView.includes(a)),
      ...enteredView
    ];

    this.setState({ annotationsInView }, () => {
      if (!this.state.showAll)
        this.notifyChange(annotationsInView, this.props.filter);
    });
  }

  onSelectAnnotation = annotation => {
    if (annotation) {
      const selection = new Selection(this.context.store, annotation, this.state.allAnnotations);
      this.props.onSelect(selection);
    } else {
      this.props.onSelect(null);
    }
  }

  onShowAll = showAll => {
    this.setState({ showAll }, () => {
      if (showAll)
        this.notifyChange(this.state.allAnnotations, this.props.filter)
      else
        this.notifyChange(this.state.annotationsInView, this.props.filter);
    });
  }

  render() {
    return React.Children.map(this.props.children, child =>
      React.cloneElement(child, { 
        showAll: this.state.showAll,
        selected: this.props.selected,
        onSelectAnnotation: this.onSelectAnnotation,
        onAnnotationsLoaded: this.onAnnotationsLoaded,
        onAnnotationsChanged: this.onAnnotationsChanged,
        onShowAll: this.onShowAll
      }));
  }

}
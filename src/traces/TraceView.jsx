import React, { Component } from 'react';

export default class TraceView extends Component {

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

  /** Re-apply filter when it changes **/
  componentWillReceiveProps(next) {
    if (this.props.filter !== next.filter) {
      const annotations = this.state.showAll ?
        this.state.allAnnotations : this.state.annotationsInView;

      this.notifyChange(annotations, next.filter);
    }
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
        onAnnotationsLoaded: this.onAnnotationsLoaded,
        onAnnotationsChanged: this.onAnnotationsChanged,
        onShowAll: this.onShowAll
      }));
  }

}
import React, { Component } from 'react';

export default class AnimatedPlaceView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      annotations: [],
      places: [],
      isMounted: false
    }
  }

  componentDidMount() {
    this.setState({ isMounted: true });
  }

  onAnnotationsChanged = ({ entered, left }) => {
    const updatedAnnotations = [ 
      ...this.state.annotations.filter(a => !left.includes(a)),
      ...entered
    ];

    this.setState({ annotations: updatedAnnotations }, () => {
      if (this.state.isMounted)
        this.props.onAnnotationsChanged(updatedAnnotations);
    });

    /*
    if (removed)
      removed.forEach(uri => updated.delete(uri));
  
    if (added)
      added.forEach(uri => updated.add(uri));

    this.setState({ places: Array.from(updated) }, () => {
      if (this.state.isMounted)
        this.props.onPlacesChanged(Array.from(updated));
    });
    */
  }

  render() {
    return React.Children.map(this.props.children, child =>
      React.cloneElement(child, { onAnnotationsChanged: this.onAnnotationsChanged }));
  }

}
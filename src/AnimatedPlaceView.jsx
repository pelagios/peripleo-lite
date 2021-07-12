import React, { Component } from 'react';

export default class AnimatedPlaceView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      places: [],
      isMounted: false
    }
  }

  componentDidMount() {
    this.setState({ isMounted: true });
  }

  onPlacesChanged = ({ added, removed }) => {
    const updated = new Set([ ...this.state.places ]);

    if (removed)
      removed.forEach(uri => updated.delete(uri));
  
    if (added)
      added.forEach(uri => updated.add(uri));

    this.setState({ places: Array.from(updated) }, () => {
      if (this.state.isMounted)
        this.props.onPlacesChanged(Array.from(updated));
    });
  }

  render() {
    return React.Children.map(this.props.children, child =>
      React.cloneElement(child, { onPlacesChanged: this.onPlacesChanged }));
  }

}
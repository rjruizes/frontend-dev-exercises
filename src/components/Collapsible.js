import React from 'react';

class Collapsible extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  render() {
    const scrollHeight = this.ref.current ? this.ref.current.scrollHeight : 0
    return (
      <div
        className='collapsible-content full-width'
        ref={this.ref}
        style={{
          marginTop: 10,
          maxHeight: this.props.filterOpen ? scrollHeight : 0
        }}
      >
        <div className='wrapper' >
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Collapsible
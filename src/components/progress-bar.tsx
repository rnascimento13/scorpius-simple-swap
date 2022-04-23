import React from "react";

type Props = {
  completed: String;
};

const ProgressBar = (props: Props) => {
  const { completed } = props;

  const containerStyles = {
    height: 18,
    width: '100%',
    backgroundColor: "#e0e0de",
    borderRadius: 50,
    margin: 0,
    
  }

  const fillerStyles = {
    height: '100%',
    width: `${completed}%`,
    backgroundColor: "#6a1b9a",
    transition: 'width 1s ease-in-out',
    borderRadius: 'inherit',
    // textAlign: 'right',
    margin: '5px 0px',
  }

  const labelStyles = {
    // paddingTop: 1,
    paddingBottom: 2,
    paddingLeft:2,
    color: '#132020',
    fontWeight: 'bold',
    display: 'ruby-text',
    fontSize: '15px',
  }

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>{`${completed}%`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;

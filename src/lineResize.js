import React from 'react';
import styled from 'styled-components';
import CardResize from './cardResize';

var dotProp = require('dot-prop-immutable');

const CardList = styled.div`
  padding-top: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')}

  /*hauteur fixe sur l'axe vertical:*/
  flex: 0 0 50px;
  display: flex;
  flex-direction:row;
  width: 400px;

  background-image: linear-gradient(to right, black 50%, rgba(255,255,255,0) 0%);
  background-position: top;
  background-size: 50px 2px;
  background-repeat: repeat-x;
`;

class LineResize extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.setState({cardList:this.props.cards});
  }

  add1OnRight(index) {
    let list = this.state.cardList;
    if (index < list.length-1 && list[index+1].widthOn16 > 1) {
      let newList = dotProp.set(list,index+'.widthOn16',list[index].widthOn16+1)
      let newList2 = dotProp.set(newList,index+1+'.widthOn16',list[index+1].widthOn16-1)
      this.setState({cardList:newList2});
      this.props.add1OnRight(index)
    }
    return;
  }

  rmv1OnRight(index) {
    let list = this.state.cardList;
    //index can't be last so list[inddex+1] exists
    if (list[index].widthOn16 > 1) {
      let newList = dotProp.set(list,index+'.widthOn16',list[index].widthOn16-1)
      let newList2 = dotProp.set(newList,index+1+'.widthOn16',list[index+1].widthOn16+1)
      this.setState({cardList:newList2});
    }
    return;
  }

  render() {
    return (
              <CardList>
                {this.state.cardList.map((card, index) =>{
                  return(
                    <CardResize
                      key={card.id}
                      card={card}
                      index={index}
                      isLast={(index===this.state.cardList.length-1)}
                      add1OnRight={()=>this.props.add1OnRight(index)}
                      rmv1OnRight={()=>this.props.rmv1OnRight(index)}
                    />)}
                  )}
              </CardList>
    );
  }
}
export default LineResize;

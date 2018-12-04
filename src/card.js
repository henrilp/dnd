import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
/*
flex: 0 0 ${props => props.widthOn16*50-2*8-2*1+'px'};
*/

const ContainerCard = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding-left: 8px;
  padding-right: 8px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')};
  width: ${props => props.widthOn16*50-2*8-2*1+'px'};
`;

const ContainerBorder = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding-left: 8px;
  padding-right: 8px;
  width: 5px;
`;

const Handle = styled.div`
  height: 100%;
  width: 100%;
  background-color: pink;
  text-align: center;
`;

class Card extends React.Component {

  render() {
    return (
        <Draggable draggableId={this.props.card.id} index={this.props.index}>
          {(provided, snapshot) => (
            <ContainerCard
              {...provided.draggableProps}
              ref={provided.innerRef}
              isDragging={snapshot.isDragging}
              widthOn16={this.props.card.widthOn16}
            >
              <Handle {...provided.dragHandleProps} >
                Tuile {this.props.card.content}<br/>
              width={this.props.card.widthOn16}
              </Handle>
            </ContainerCard>
          )}
        </Draggable>
    );
  }
}
export default Card;

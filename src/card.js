import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
/*
flex: 0 0 ${props => props.widthOn16*50-2*8-2*1+'px'};
*/

const ContainerCard = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : 'white')};
  /*width fixed*/
  flex: 0 0 ${props => props.widthOn16*25-2+'px'};
  text-align: center;
`;

class Card extends React.Component {

  render() {
    return (
        <Draggable draggableId={this.props.card.id} index={this.props.index}>
          {(provided, snapshot) => (
            <ContainerCard
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              isDragging={snapshot.isDragging}
              widthOn16={this.props.card.widthOn16}
            >
              id{this.props.card.content}<br/>
              l={this.props.card.widthOn16}
            </ContainerCard>
          )}
        </Draggable>
    );
  }
}
export default Card;

import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import initialData from './initial-data';
import Line from './line';
import LineResize from './lineResize';

var dotProp = require('dot-prop-immutable');

const ContainerLines = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  border: 1px solid lightgrey;
  float: left;
`;

const ContainerSpe = styled.div`
  border: 2px solid lightgrey;
  width: 200px;
  display: flex;
  flex-direction: column;
  /*****/
`;

const ContainerSpeButton = styled.div`
  text-align: center;
`;

const ContainerSpeDroppable = styled.div`
  background-color: ${props => (props.isDraggingOver ? 'skyblue' : 'white')}
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const ContainerCardRow = styled.div`
  flex: 0 0 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

const ContainerCard = styled.div`
  border: 1px solid grey;
  border-radius: 2px;
  background-color: ${props => (props.isDragging ? 'lightgreen' : '#F7D358')};
  flex: 0 0 48px;
  text-align: center;
  line-height: 50px;
  width: 48px;
  transition: flex-basis 500ms ease-in-out;
`;



export default class App extends React.Component {
  state = {data:initialData,mode:'dnd'};

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

/***********************/
  onDragEnd = result => {
    const { destination, source, draggableId } = result;

    //CASES WHERE DOES NOTHING
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    let newData = this.state.data;
    let startLine, finishLine, cardId;

    //initiate cardId
    //CASE CREATE CARD
    if (source.droppableId === 'speContainer') {
      //update cardId
      cardId = 'newCard-0';
      while (newData.cards.hasOwnProperty(cardId)) {
        let num = parseInt(cardId.split('-')[1])+1;
        cardId = 'newCard-'+num; /*unique ID*/
      }//update newData.cards
      let newCard = {
          id: cardId,
          color:this.getRandomColor(),
          widthOn16:2,
      };
      newData = dotProp.merge(newData,'cards.'+cardId,newCard);
    } // ELSE
    else cardId = draggableId;

    //CASE DELETE CARD
    if (destination.droppableId === 'speContainer'
      && source.droppableId !== 'speContainer') {
      let lineId = source.droppableId;
      let cardList = dotProp.get(newData.lines,lineId+'.cardIds');
      //delete in line
      cardList.splice(cardList.indexOf(cardId),1);
      //delete in cards
      newData = dotProp.delete(newData,'cards.'+cardId);
      return;
    }

    //initiate finishLine
    //CASE CREATE FINISHLINE
    if (destination.droppableId === 'lineEmpty'){
      let lineId = 'newLine-0';
      while (newData.lines.hasOwnProperty(lineId)) {
        let num = parseInt(lineId.split('-')[1])+1;
        lineId = 'newLine-'+num; /*unique ID*/
      }
      let newLine = {
          id: lineId,
          cardIds:[],
      };
      newData = dotProp.merge(newData,'lines.'+lineId,newLine);
      newData.lineOrder.push(lineId);
      finishLine = newData.lines[lineId];                        //ref
    } //ELSE
    else finishLine = newData.lines[destination.droppableId];    //ref

    //cancel if finishline already full
    if (finishLine.cardIds.length === 16) return;

    //initiate startLine
    startLine = newData.lines[source.droppableId];               //ref

    //ARRANGE STARTLINE CARDS if not new card
    if (source.droppableId !== 'speContainer') {
      newData = this.arrangeStartLineCards(newData,startLine.id,cardId);
    }

    //ARRANGE FINISHLINE CARDS if not delete card
    if (!(destination.droppableId === 'speContainer' && source.droppableId !== 'speContainer')) {
      newData = this.arrangeFinishLineCards(newData,finishLine.id,cardId,destination.index);
    }

    //clean empty lines
    newData = this.rmvLineIfNeeded(newData);

    // YESSS
    this.setState({data:newData});
  };

  arrangeStartLineCards(data,lineId,cardId){
    let cardIds = data.lines[lineId].cardIds;
    //delete the card in the line
    cardIds.splice(cardIds.indexOf(cardId),1);
    //on rallonge la dernière card de la start line
    let lastCardId = cardIds[cardIds.length-1];
    let widthOn16LastCard = dotProp.get(data.cards,lastCardId+'.widthOn16');
    let widthOn16Card = dotProp.get(data.cards,cardId+'.widthOn16');
    data = dotProp.set(data,'cards.'+lastCardId+'.widthOn16',widthOn16Card+widthOn16LastCard);
    return data;
  }

  arrangeFinishLineCards(data,lineId,cardId,index){
    let cardIds = data.lines[lineId].cardIds; //ref
    //case new line
    if (cardIds.length === 0) {
      //insert
      cardIds.push(cardId);
      data = dotProp.set(data,'cards.'+cardId+'.widthOn16',16);
    }// else choose 1 or 2 in length then look for big neighbors
    else {
      //insert
      cardIds.splice(index, 0, cardId);
      if (index !== 0 && index !== cardIds.length - 1){
        let widthAtLeft = dotProp.get(data.cards,cardIds[index-1]+'.widthOn16');
        let widthAtRight = dotProp.get(data.cards,cardIds[index+1]+'.widthOn16');
        if (widthAtLeft > 2 && widthAtRight > 2) {
          //case big neighbors
          data = dotProp.set(data,'cards.'+cardId+'.widthOn16',2)
          data = dotProp.set(data,'cards.'+cardIds[index-1]+'.widthOn16',widthAtLeft-1);
          data = dotProp.set(data,'cards.'+cardIds[index+1]+'.widthOn16',widthAtRight-1);
          return data;
        }
      }
      //other case : check all modulo neighbors in range 1 then 2 etc
      data = dotProp.set(data,'cards.'+cardId+'.widthOn16',1);
      let range = 1;
      while( range < cardIds.length ) {
        let rightRangedNeighborIndex = Math.abs((index+range) % cardIds.length);
        let rightRangedNeighborWidthOn16 = dotProp.get(data.cards,cardIds[rightRangedNeighborIndex]+'.widthOn16');
        if (rightRangedNeighborWidthOn16 > 1) {
          data = dotProp.set(data,'cards.'+cardIds[rightRangedNeighborIndex]+'.widthOn16',rightRangedNeighborWidthOn16-1);
          break;
        }
        let leftRangedNeighborIndex = Math.abs((index-range) % cardIds.length);
        let leftRangedNeighborWidthOn16 = dotProp.get(data.cards,cardIds[leftRangedNeighborIndex]+'.widthOn16');
        if (leftRangedNeighborWidthOn16 > 1) {
          data = dotProp.set(data,'cards.'+cardIds[leftRangedNeighborIndex]+'.widthOn16',leftRangedNeighborWidthOn16-1);
          break;
        }
        range++;
      }
    }
    return data;
  }

  rmvLineIfNeeded(data){
    for(var lineId in data.lines) {
      if (data.lines[lineId].cardIds.length === 0) {
        data = dotProp.delete(data,'lines.'+lineId);
        data.lineOrder.splice(data.lineOrder.indexOf(lineId),1);
      }
    }
    return data;
  }


  add1OnRight(lineId,index) {
    let line =  this.state.data.lines[lineId];
    let cards = line.cardIds.map(cardId => this.state.data.cards[cardId]);
    if (index < cards.length-1 && cards[index+1].widthOn16 > 1) {
      let newData = dotProp.set(this.state.data,'cards.'+cards[index].id+'.widthOn16',cards[index].widthOn16+1);
      newData = dotProp.set(newData,'cards.'+cards[index+1].id+'.widthOn16',cards[index+1].widthOn16-1);
      this.setState({data:newData});
    } else this.setState({message:"Vous avez atteint la taille minimale d'un élément !"})
    return;
  }

  rmv1OnRight(lineId,index) {
    let line =  this.state.data.lines[lineId];
    let cards = line.cardIds.map(cardId => this.state.data.cards[cardId]);
    if (cards[index].widthOn16 > 1) {
      let newData = dotProp.set(this.state.data,'cards.'+cards[index].id+'.widthOn16',cards[index].widthOn16-1);
      newData = dotProp.set(newData,'cards.'+cards[index+1].id+'.widthOn16',cards[index+1].widthOn16+1);
      this.setState({data:newData});
    } else this.setState({message:"Vous avez atteint la taille minimale d'un élément !"})
    return;
  }

  render() {
    return (
        <DragDropContext onDragEnd={this.onDragEnd} >
          <div style={{display:'flex'}}>
            <ContainerLines>
              {this.state.data.lineOrder.map(lineId => {
                const line =  this.state.data.lines[lineId];
                const cards = line.cardIds.map(cardId => this.state.data.cards[cardId]);
                if (this.state.mode!=='resize') return <Line key={line.id} line={line} cards={cards}/>;
                else {
                  return <LineResize key={line.id} line={line} cards={cards}
                    rmv1OnRight={(e)=>this.rmv1OnRight(lineId,e)}
                    add1OnRight={(e)=>this.add1OnRight(lineId,e)}/>;
                  }
              })}
              {/*** EMPTY LINE ***/}
              {this.state.mode!=='resize' ? <Line line={{id:'lineEmpty'}} cards={[]}/>
            : <LineResize line={{id:'lineEmpty'}} cards={[]}/>}
            </ContainerLines>

            {/*******  CONTAINER SPE   ******/}
            <ContainerSpe>
              <ContainerSpeButton>
              <button type='button' onClick={()=>{
                  if (this.state.mode==='resize') {
                    this.setState({mode:'dnd'});
                  } else this.setState({mode:'resize'});
              }}>
                switch mode
              </button>
              </ContainerSpeButton>

              <Droppable droppableId={'speContainer'} direction="vertical">
                {(provided, snapshot) => (
                <ContainerSpeDroppable
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                {/*** NEW CARD ***/}
                <ContainerCardRow>
                  <Draggable draggableId={'newCard'} index={0}>
                    {(provided, snapshot) => (
                      <ContainerCard
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        isDragging={snapshot.isDragging}
                        widthOn16={2}
                      >
                        Drag!
                      </ContainerCard>
                    )}
                  </Draggable>
                  </ContainerCardRow>
                  {provided.placeholder}
                </ContainerSpeDroppable>
                )}
              </Droppable>
            </ContainerSpe>
          </div>
        </DragDropContext>
    )
  }
}
ReactDOM.render(<App />, document.getElementById('root'));

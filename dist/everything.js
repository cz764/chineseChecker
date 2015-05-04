(function() {

'use strict';

angular.module('myApp',[]).factory('gameLogic',function(){
  
  var chain_1;
  var chain_2;
  
  function isEqual(object1, object2) {
      return angular.equals(object1, object2);
    }
    
    function copyObject(object) {
      return angular.copy(object);
    }
  
  function getWinner(board){
  var winStringX = JSON.stringify(
      board[5][1] 
    + board[5][2] + board[6][2]
    + board[5][3] + board[6][3] + board[7][3]
    + board[5][4] + board[6][4] + board[7][4] + board[8][4]
  );
  if (winStringX === JSON.stringify("XXXXXXXXXX")){
    return "X";
  }
  var winStringO = JSON.stringify(
      board[13][17] 
    + board[12][16] + board[13][16]
    + board[11][15] + board[12][15] + board[13][15]
    + board[10][14] + board[11][14] + board[12][14] + board[13][14]
  );
  if (winStringO === JSON.stringify("OOOOOOOOOO")){
    return "O";
  }
  return '';
  }



/*
function isEqual(object1, object2) {
    return JSON.stringify(object1) === JSON.stringify(object2);
  }
*/

function checkPosition(row,col,board){
  if(board[row][col] === '' || board[row][col] === undefined){
      console.log("The position of row, col: (" + row + ", " + col + ") has been outside of the board!");
      return false;
    }else{
      return true;
    }
}


function isOneStepMove(oldrow,oldcol,row,col){
  if( (Math.abs(oldrow-row)+Math.abs(oldcol-col))==1 ){
    console.log("move is one step around location");
    chain_1 = {set: {key: 'isChain', value: false}};
    chain_2 = {set: {key:'chainValue',value: [[oldrow,oldcol],[row,col]]}};
    return true;
  }
  else if( (row==oldrow+1 && col==oldcol+1) || (row==oldrow-1 && col==oldcol-1) ){
    console.log("move is one step around location");
    chain_1 = {set: {key: 'isChain', value: false}};
    chain_2 = {set: {key:'chainValue',value: [[oldrow,oldcol],[row,col]]}};
    return true;
  }else{
    console.log("move takes more steps around location");
    return false;
  }
}


function Jump(row,col,board) {
  var pointPool = new Array();
  var i = 0;
  if(board[row][col+1] != '' && board[row][col+1] != 'a'){
    if(board[row][col+2] == 'a'){
      pointPool[i] = [row,col+2];
      i+=1;
    }
  }
  if(board[row+1][col+1] != '' && board[row+1][col+1] != 'a'){
    if(board[row+2][col+2] == 'a'){
      pointPool[i] = [row+2,col+2];
      i+=1;
    }
  }
  if(board[row+1][col] != '' && board[row+1][col] != 'a'){
    if(board[row+2][col] == 'a'){
      pointPool[i] = [row+2,col];
      i+=1;
    }
  }
  if(board[row][col-1] != '' && board[row][col-1] != 'a'){
    if(board[row][col-2] == 'a'){
      pointPool[i] = [row,col-2];
      i+=1;
    }
  }
  if(board[row-1][col-1] != '' && board[row-1][col-1] != 'a'){
    if(board[row-2][col-2] == 'a'){
      pointPool[i] = [row-2,col-2];
      i+=1;
    }
  }
  if(board[row-1][col] != '' && board[row-1][col] != 'a'){
    if(board[row-2][col] == 'a'){
      pointPool[i] = [row-2,col];
    }
  }
  return pointPool;
}


function isContain(arr,value) {
  for(var i=0; i<arr.length; i++){
    if(arr[i][0] == value[0] && arr[i][1] == value[1]){
      return true;
    }
  }
  return false;
}

// the new version of isMultiStepMoves now can trace 
// the movements of each step within this multi-jump
// make sure the history logs jump always with steps
// greater or equal to two.
function isMultiStepMoves(oldrow,oldcol,row,col,boardBeforeMove){
  var key = true;
  var _row;
  var _col;
  var tempPool;
  var historyPoint;
  var pointPool = new Array();
  pointPool[0] = [oldrow,oldcol,true,[[oldrow,oldcol]]];
  while(true){
    key = false;
    for(var i=0; i<pointPool.length; i++){
      if(pointPool[i][2] == true){
        _row = pointPool[i][0];
        _col = pointPool[i][1];
        historyPoint = pointPool[i][3];
        pointPool[i][2] = false;
        key = true;
        break;
      }
    }
    if(key == false){
      //do something before break
      break;
    }
    tempPool = Jump(_row,_col,boardBeforeMove);
    if(tempPool.length == 0){
      continue;
    }
    for(var j=0; j<tempPool.length; j++){
      if(isContain(pointPool,tempPool[j])==true){
        continue;
      }
      historyPoint.push([tempPool[j][0],tempPool[j][1]]);
      var tempHistory = JSON.parse(JSON.stringify(historyPoint));
      pointPool[pointPool.length] = [tempPool[j][0],tempPool[j][1],true,tempHistory];
      if(tempPool[j][0]==row && tempPool[j][1]==col){
        console.log(historyPoint);
        if(historyPoint.length===2){
          chain_1 = {set: {key: 'isChain', value: false}};
          chain_2 = {set: {key:'chainValue',value: historyPoint}};
        }else{
          chain_1 = {set: {key: 'isChain', value: true}};
          chain_2 = {set: {key:'chainValue',value: historyPoint}};
        }
        return true;
      }
      historyPoint.pop();
    }
  }
  chain_1 = {};
  chain_2 = {};
  return false; 
}


function createMove(oldrow,oldcol,row,col,turnIndexBeforeMove,boardBeforeMove){ 
  
  if(boardBeforeMove === undefined) {
    boardBeforeMove = [
    ['','','','','','','','','','','','','','',''],
    ['','','','','','a','','','','','','','','',''],
    ['','','','','','a','a','','','','','','','',''],
    ['','','','','','a','a','a','','','','','','',''],
    ['','','','','','a','a','a','a','','','','','','','','',''],
    ['','O','O','O','O','a','a','a','a','a','a','a','a','a',''],
    ['','','O','O','O','a','a','a','a','a','a','a','a','a',''],
    ['','','','O','O','a','a','a','a','a','a','a','a','a',''],
    ['','','','','O','a','a','a','a','a','a','a','a','a',''],
    ['','','','','','a','a','a','a','a','a','a','a','a',''],
    ['','','','','','a','a','a','a','a','a','a','a','a','X',''],
    ['','','','','','a','a','a','a','a','a','a','a','a','X','X',''],
    ['','','','','','a','a','a','a','a','a','a','a','a','X','X','X',''],
    ['','','','','','a','a','a','a','a','a','a','a','a','X','X','X','X',''],
    ['','','','','','','','','','','a','a','a','a','','','','','','','',''],
    ['','','','','','','','','','','','a','a','a',''],
    ['','','','','','','','','','','','','a','a',''],
    ['','','','','','','','','','','','','','a',''],
    ['','','','','','','','','','','','','','','']
    ];
  }
  
    //check the correctness of movement
  if (checkPosition(row,col,boardBeforeMove) === false){  // checkPosition 01 - boundary
      throw new Error("One can not make a move outside of the board!");
    }
    if(boardBeforeMove[row][col] !== 'a'){
      throw new Error("One can only make a move in an empty position!");
    }
    //var boardAfterMove = JSON.parse(JSON.stringify(boardBeforeMove));
    var boardAfterMove = copyObject(boardBeforeMove);
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'O' : 'X';     //Index => 0 than 'O', turnIndex => 1 than 'X'
    if(boardAfterMove[oldrow][oldcol]===boardAfterMove[row][col]){
    boardAfterMove[oldrow][oldcol] = 'a';
  }else{
    throw new Error("The original chess piece is not the expected one!");
  }
  
  var winner = getWinner(boardAfterMove);
  var firstOperation;
  var score = [0, 1];
  var noWinner = false;
  if(winner !== ''){
    if(winner === 'O'){
      score = [1, 0];
    }
    firstOperation = {endMatch: {endMatchScores: score}};
        
        console.log("player: "+ winner + " WIN!");
  }else{
    noWinner = true;
    //firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
  }
  
  if (isOneStepMove(oldrow,oldcol,row,col)===true){
    console.log("single movement");
    if(noWinner){
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
    }
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: {oldrow: oldrow, oldcol: oldcol, row: row, col: col}}},
            chain_1,
            chain_2];
  }
  else if(isMultiStepMoves(oldrow,oldcol,row,col,boardBeforeMove)===true){
    console.log("multiple movements");
    if(noWinner){
      if(chain_2.set.value.length===2){
        firstOperation = {setTurn: {turnIndex: 1-turnIndexBeforeMove}};
      }else{
        firstOperation = {setTurn: {turnIndex: 1-turnIndexBeforeMove}};
      }
    }
    return [firstOperation,
            {set: {key: 'board', value: boardAfterMove}},
            {set: {key: 'delta', value: {oldrow: oldrow, oldcol: oldcol, row: row, col: col}}},
            chain_1,
            chain_2];
  }
  else{
    console.log("illegal move!");
    throw new Error("Illegal move!");
  }   
}

function getInitialBoard() {
    return [
    ['','','','','','','','','','','','','','',''],
    ['','','','','','a','','','','','','','','',''],
    ['','','','','','a','a','','','','','','','',''],
    ['','','','','','a','a','a','','','','','','',''],
    ['','','','','','a','a','a','a','','','','','','','','',''],
    ['','O','O','O','O','a','a','a','a','a','a','a','a','a',''],
    ['','','O','O','O','a','a','a','a','a','a','a','a','a',''],
    ['','','','O','O','a','a','a','a','a','a','a','a','a',''],
    ['','','','','O','a','a','a','a','a','a','a','a','a',''],
    ['','','','','','a','a','a','a','a','a','a','a','a',''],
    ['','','','','','a','a','a','a','a','a','a','a','a','X',''],
    ['','','','','','a','a','a','a','a','a','a','a','a','X','X',''],
    ['','','','','','a','a','a','a','a','a','a','a','a','X','X','X',''],
    ['','','','','','a','a','a','a','a','a','a','a','a','X','X','X','X',''],
    ['','','','','','','','','','','a','a','a','a','','','','','','','',''],
    ['','','','','','','','','','','','a','a','a',''],
    ['','','','','','','','','','','','','a','a',''],
    ['','','','','','','','','','','','','','a',''],
    ['','','','','','','','','','','','','','','']
    ];
  }

// To show this example Moves through $animate, additional
// verifications are needed in that problems with turnIndex
function getExampleMoves(initialTurnIndex, initialState, arrayOfRowColSets){
  var exampleMove = [];
  var state = initialState;
  var turnIndex = initialTurnIndex;
  for(var i=0; i<arrayOfRowColSets.length; i++){
    var rowColSets = arrayOfRowColSets[i];
    var move = createMove(rowColSets.oldrow,rowColSets.oldcol,rowColSets.row, rowColSets.col,turnIndex,state.board);
    var stateAfterMove = {board : move[1].set.value, delta : move[2].set.value};
    exampleMove.push({
      stateBeforeMove: state,
          stateAfterMove: stateAfterMove,
          turnIndexBeforeMove: turnIndex,
          //turnIndexAfterMove: 1 - turnIndex,
          move: move,
          comment: {en: rowColSets.comment}
    });
    state = stateAfterMove;
    turnIndex = move[0].setTurn.turnIndex;
  }
  return exampleMove; 
}

function getExampleGame(){
  return getExampleMoves(0, {}, [
    {oldrow: 6, oldcol: 4, row: 6, col: 5, comment: "First player usually might move a topmost piece one step towards its opposite corner"},
    {oldrow: 11, oldcol: 14, row: 11, col: 13, comment: "Second player gets a similar move from his own corner"},
    {oldrow: 6, oldcol: 2, row: 6, col: 6, comment: "Two consecutive hops takes place during the first player's turn. A hop consist of jumping over a single adjacent piece, only the diagonal direction is allowed"},
    {oldrow: 12, oldcol: 15, row: 12, col: 13, comment: "Second player also provides a single hop from the middle of his second line, and jumps one more step based on one of the piece in his topmost line"},
    {oldrow: 7, oldcol: 4, row: 7, col: 5, comment: "One step in its adjacent empty position towards the opposite corner， A player may not combine hopping with a single move"},
    {oldrow: 13, oldcol: 14, row: 11, col: 12, comment: "A single hop based on his own pieces"},
    {oldrow: 5, oldcol: 2, row: 7, col: 6, comment: "Two consecutive hops based on his own pieces"},
    {oldrow: 11, oldcol: 12, row: 11, col: 11, comment: "One step in its adjacent empty position in order to provide other pieces a better chance to move more steps"},
    {oldrow: 7, oldcol: 6, row: 8, col: 7, comment:"First player gives a single move on the piece's adjacent empty space"},
    {oldrow: 13, oldcol: 16, row: 11, col: 10, comment:"Second player has a three-step-hops move towards the opposite corner, The more distance your piece takes place, the better chance you win"},
    {oldrow: 5, oldcol: 1, row: 5, col: 2, comment:"First player moves the innermost piece one step to prepare for another long jump"},
    {oldrow: 11, oldcol: 10, row: 10, col: 9, comment:"Second player takes one move to form a longer bridge to prepare for a long jump as well"},
    {oldrow: 5, oldcol: 2, row: 9, col: 8, comment:"First player provides a three-step-hops, now arround the new location, there are two kind of pieces"},
    {oldrow: 12, oldcol: 14, row: 10, col: 8, comment:"Second player takes a three-step-hops again"},
    {oldrow: 9, oldcol: 8, row: 13, col: 16, comment:"First player makes use of his opponent's pieces, provides a four-step-hops and finally located in his opponent's corner, He'll win the game if all his pieces firstly place in the opposite corner"},
    {oldrow: 11, oldcol: 15, row: 11, col: 14, comment:"Second player makes one step move"},
    {oldrow: 5, oldcol: 4, row: 13, col: 14, comment:"First player makes a five-step-hops based on both his and his opponent's pieces"},
    {oldrow: 11, oldcol: 14, row: 5, col: 2, comment:"Second player makes a even better six-step-hops based on both sides' pieces"},
    {oldrow: 6, oldcol: 6, row: 7, col: 6, comment:"First player takes a one step move, wants to block the 'bridge' as well as to prepare for the next long jump"},
    {oldrow: 13, oldcol: 17, row: 11, col: 15, comment:"Second player gives a hop from the innermost corner"},
    {oldrow: 7, oldcol: 6, row: 11, col: 14, comment:"First player takes a four-step-hops and settles another his piece in his opposite corner"},
    {oldrow: 10, oldcol: 14, row: 10, col: 10, comment:"Second player takes a three-step-hops"},
    {oldrow: 6, oldcol: 5, row: 7, col: 6, comment:"First player provides a single move"},
    {oldrow: 10, oldcol: 8, row: 9, col: 8, comment:"Second player also takes a single move to block his opponent's further jump"},
    {oldrow: 13, oldcol: 16, row: 13, col: 17, comment:"First player occupied the innermost corner with one single move, in most case this piece will never move again"},
    {oldrow: 10, oldcol: 10, row: 6, col: 4, comment:"Second player makes some progress, with a four-step-hops, another piece reaches the opposite corner"},
    {oldrow: 13, oldcol: 14, row: 13, col: 16, comment:"First player gets a hop in his opposite corner"},
    {oldrow: 11, oldcol: 13, row: 11, col: 12, comment:"Second player gives a single move before jumping "},
    {oldrow: 8, oldcol: 4, row: 7, col: 4, comment:"First player gives a single move before jumping"},
    {oldrow: 9, oldcol: 8, row: 9, col: 7, comment:"Second player moves away the blocker on 'bridge'"},
    {oldrow: 7, oldcol: 6, row: 11, col: 10, comment:"First player forward a piece on the bridge, but still be blocked by another piece, one can not jump through two or more adjacent pieces"},
    {oldrow: 11, oldcol: 12, row: 12, col: 12, comment:"Second player moves his bridge blocker one step away, try to use another diagonal way to jump, but this is a mistake, his opponent now can make use of the whole 'bridge'"},
    {oldrow: 11, oldcol: 10, row: 13, col: 14, comment:"First player gives a two-step-hops, another piece has been settled in the corner"},
    {oldrow: 12, oldcol: 12, row: 8, col: 6, comment:"Second player forward his piece by three-step-hops, but still blocked by his own piece"},
    {oldrow: 7, oldcol: 4, row: 11, col: 12, comment:"First player gives a four-step-hops"},
    {oldrow: 5, oldcol: 2, row: 5, col: 1, comment:"Second player moves a piece to the innermost corner"},
    {oldrow: 11, oldcol: 12, row: 11, col: 13, comment:"First player takes a single move to form a better 'bridge'"},
    {oldrow: 13, oldcol: 15, row: 12, col: 14, comment:"Second player provides a single move"},
    {oldrow: 11, oldcol: 14, row: 12, col: 15, comment:"First player also maneuvers his piece in the opposite corner to make room for newly imcoming pieces"},
    {oldrow: 12, oldcol: 14, row: 10, col: 8, comment:"Second player gives a three-step-hops on the bridge, but still be blocked"},
    {oldrow: 7, oldcol: 3, row: 7, col: 4, comment:"First player makes a single move on his side of 'bridge'"},
    {oldrow: 6, oldcol: 4, row: 6, col: 2, comment:"Second player gives a hop to clear the end of 'bridge'"},
    {oldrow: 7, oldcol: 4, row: 11, col: 14, comment:"First player provides a long consecutive jumps from the beginning of the 'bridge' to the end"},
    {oldrow: 8, oldcol: 6, row: 6, col: 4, comment:"Second player makes a one-step-hop to clean the end of his 'bridge'"},
    {oldrow: 11, oldcol: 14, row: 12, col: 14, comment:"First player makes a hop to clean his end of 'bridge' as well"},
    {oldrow: 12, oldcol: 16, row: 10, col: 14, comment:"Second player makes a hop"},
    {oldrow: 6, oldcol: 3, row: 7, col: 4, comment:"First player gives a single move before a long jump"},
    {oldrow: 6, oldcol: 4, row: 6, col: 3, comment:"Second player provides a hop to make room for a new long jump"},
    {oldrow: 7, oldcol: 4, row: 11, col: 14, comment:"First player makes a long jump, it's cool"},
    {oldrow: 6, oldcol: 3, row: 5, col: 2, comment:"Second player makes a single move"},
    {oldrow: 12, oldcol: 14, row: 13, col: 15, comment:"First player also makes a single move"},
    {oldrow: 10, oldcol: 8, row: 6, col: 4, comment:"Second player gets a two-step-hops and reaches the opposite corner"},
    {oldrow: 8, oldcol: 7, row: 9, col: 8, comment:"First player takes a single move, he may decide to fold his 'bridge' at the end of game"},
    {oldrow: 6, oldcol: 4, row: 6, col: 3, comment:"Second player makes a single move the clean up a room"},
    {oldrow: 5, oldcol: 3, row: 6, col: 4, comment:"First player makes a single move, the final piece in his corner is now waiting on the entry of the 'bridge'"},
    {oldrow: 11, oldcol: 15, row: 9, col: 13, comment:"Second player jumps with a hop in his own corner"},
    {oldrow: 6, oldcol: 4, row: 12, col: 16, comment:"First player makes a cool six-step-hops into his opposite corner"},
    {oldrow: 9, oldcol: 13, row: 10, col: 13, comment:"Second player wants to reach his 'bridge', so he makes a single move towards it"},
    {oldrow: 11, oldcol: 14, row: 11, col: 15, comment:"First player makes a single move"},
    {oldrow: 10, oldcol: 14, row: 10, col: 12, comment:"Second player just makes a hop in his own corner"},
    {oldrow: 9, oldcol: 8, row: 11, col: 14, comment:"First player takes a three-step-hops, now only two pieces are not in his opposite corner"},
    {oldrow: 10, oldcol: 13, row: 10, col: 11, comment:"Second player makes a hop towards still his 'bridge'"},
    {oldrow: 7, oldcol: 5, row: 8, col: 6, comment:"First player gives a single move before a long jump"},
    {oldrow: 10, oldcol: 12, row: 11, col: 12, comment:"Second player provides a single move"},
    {oldrow: 8, oldcol: 6, row: 12, col: 14, comment:"First player makes a four-step-hops into its corner"},
    {oldrow: 11, oldcol: 12, row: 9, col: 6, comment:"Second player gets a three-step-hops"},
    {oldrow: 11, oldcol: 14, row: 10, col: 14, comment:"First player makes a single move before final win"},
    {oldrow: 9, oldcol: 6, row: 8, col: 5, comment:"Second player makes a single move to form a new 'bridge'"},
    {oldrow: 11, oldcol: 13, row: 11, col: 14, comment:"First player makes a final single move, now all his pieces are firstly in his opponent's corner, this gets him win the game"}
  ]);
}

// The platform will use isMoveOk to check validation
// Make sure every thing passing to platform is correct
// For long jump movement, create board and state step
// by step according to chain value before send to platform
function isMoveOk(params){
  try{
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove; 
      var stateBeforeMove = params.stateBeforeMove;     
      var deltaValue = move[2].set.value;
      var oldrow = deltaValue.oldrow;
        var oldcol = deltaValue.oldcol;
        var row = deltaValue.row;
        var col = deltaValue.col;
        var boardBeforeMove = stateBeforeMove.board;
        var boardAfterMove = move[1].set.value;
        
    var expectedMove = createMove(oldrow,oldcol,row,col,turnIndexBeforeMove,boardBeforeMove);
    if(!isEqual(move[1], expectedMove[1]) || !isEqual(move[2], expectedMove[2])){
      return false;
    }
  } catch(e) {
    return false;
  }
  return true;
  }
  
  /**
   * Returns the move that the computer player should do for the given board.
   * The computer will play in a random empty cell in the board.
   */
  var members = [];
  var possibleOutcomes = [];
  var targets = [[[5,4],[6,4],[7,4],[8,4]],
             [[5,3],[6,3],[7,3]],
             [[5,2],[6,2]],
             [[5,1]]
            ];
  var tar_row=0;
  var tar_col=0;
  var index = 1;   // look forward 1 steps
  
  function isMember(row,col,members){
    var i;
    for(i=0; i<members.length; i++){
      if(members[i][0]===row && members[i][1]===col){
        return true;
      }
    }
    return false;
  }
  
  function getTargets(){    
    var cur_tar_line = targets[targets.length-1];
    var tempR = Math.floor(Math.random() * cur_tar_line.length);
    tar_row = cur_tar_line[tempR][0];
    tar_col = cur_tar_line[tempR][1];
    cur_tar_line.splice(tempR, 1);
    if(cur_tar_line.length === 0){
      targets.pop();
    }
    if(targets.length===0){
      return false;
    }else{
      return true;
    }
  }  
  
  function getTargetsIn(myTargets){
    var cur_tar_line = myTargets[myTargets.length-1];
    var tempR = Math.floor(Math.random() * cur_tar_line.length);
    var tar_row = cur_tar_line[tempR][0];
    var tar_col = cur_tar_line[tempR][1];
    cur_tar_line.splice(tempR, 1);
    if(cur_tar_line.length === 0){
      myTargets.pop();
    }
    if(myTargets.length===0){
      return {flag:false, value:[tar_row, tar_col]};
    }else{
      return {flag:true, value:[tar_row, tar_col]};
    }
  }
  
  function thinkThreeSteps(mymove, tar_row, tar_col,targets, member, myboard, index){
      if(targets.length === 0){
        return {distance: 0};
      }
      var i, j;
      var row = tar_row;
      var col = tar_col;
      var curIndex = index - 1;
      var myTargets = angular.copy(targets);
      var myMembers = angular.copy(member);
      var curboard = angular.copy(myboard);
      
      while(1){
        if(row===0 && col===0){
          var results = getTargetsIn(myTargets);
          row = results.value[0];
          col = results.value[1];
        }
        if(myboard[row][col] === 'X'){
          myMembers.push([row,col]);
          row=0;
          col=0;
        }else{
          break;
        }
      }
      
      if(curIndex === 0){
          var possibleMoves = [];
          for (i = 1; i < 19; i++) {
          for (j = 1; j < curboard[i].length; j++) {
            
            if(curboard[i][j]==='X'){
              if(isMember(i,j,myMembers)){
                continue;
              }
              var r,c;
              var dist = 0;
              var tempD,tempMove;
               for (r = 1; r < 19; r++) {
                for (c = 1; c < curboard[i].length; c++) {
                  try{
                    tempMove = createMove(i,j,r,c,1,curboard);
                    tempD = Math.abs(c-j)*0.2 - Math.abs(c-col)*0.5 + Math.abs(j-col)*1.0 - Math.abs(r-row)*0.7;
                    if(dist === 0){
                      dist = tempD;
                      possibleMoves.push({distance: dist, value: [[i,j],[r,c]], move: tempMove});
                    }
                    if(tempD > dist){
                      dist = tempD;   // Math value will not change but obj does when passing values
                      possibleMoves.pop();
                      possibleMoves.push({distance: dist, value: [[i,j],[r,c]], move: tempMove});
                    }
                  }catch(e){
                    // illegal move yo~
                  }
                }
              } 
            }
          }
        }
        //var randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        var bestMove = possibleMoves[0];
        for(i=0; i<possibleMoves.length; i++){
          if(bestMove.distance < possibleMoves[i].distance){
            bestMove = possibleMoves[i];
          }
        }
        return bestMove;            
        
      }else{
              
        for (i = 1; i < 19; i++) {
          for (j = 1; j < curboard[i].length; j++) {
            if(curboard[i][j]==='X'){
              if(isMember(i,j,myMembers)){
                continue;
              }
              
              var r,c;
              var dist = 0;
              var tempD,tempMove;
               for (r = 1; r < 19; r++) {
                for (c = 1; c < curboard[i].length; c++) {
                  try{
                    tempMove = createMove(i,j,r,c,1,curboard);
                    tempD = Math.abs(c-j)*0.2 - Math.abs(c-col)*0.5 + Math.abs(j-col)*1.0 - Math.abs(r-row)*0.7;                    
                  }catch(e){
                    // illegal move yo~
                    tempD = -100;
                  }
                  if(tempD === -100){
                    continue;
                  }
                  var newboard = angular.copy(curboard);
                  newboard[i][j] = 'a';
                  newboard[r][c] = 'X';
                  if(r===row && c===col){
                    var newMembers = angular.copy(myMembers);
                    newMembers.push([row, col]);
                    var newrow = 0;
                    var newcol = 0;
                 }else{
                  var newMembers = angular.copy(myMembers);
                    var newrow = row;
                    var newcol = col;
                 }
                 var myNewMove = angular.copy(mymove);
                 if(myNewMove.distance === undefined){
                  myNewMove = {distance: tempD, value: [[i,j],[r,c]], move: tempMove};
                 }else{
                  myNewMove.distance += tempD;
                 }
                 var childResult = thinkThreeSteps(myNewMove, newrow, newcol, myTargets, newMembers, newboard, curIndex);
                   if(curIndex === 1){
                    myNewMove.distance += childResult.distance;
                    possibleOutcomes.push(myNewMove);
                   }  
                   //return true;                                                 
                }
              }
            }           
          }
      }

      }
      
  }
    
  function createComputerMove(board, turnIndexBeforeMove) {
    possibleOutcomes = [];
      while(1){
        if(tar_row===0 && tar_col===0){
          getTargets();
        }
        if(board[tar_row][tar_col] === 'X'){
          members.push([tar_row,tar_col]);
          tar_row=0;
          tar_col=0;
        }else{
          break;
        }
      }
      var mymove = {};
      var bestMove = thinkThreeSteps(mymove, tar_row, tar_col,targets, members, board, index);
      if(index!=1){
        var bestMove = possibleOutcomes[0];
        var i;
    for(i=0; i<possibleOutcomes.length; i++){
       if(bestMove.distance < possibleOutcomes[i].distance){
          bestMove = possibleOutcomes[i];
       }
    }
      }
      
    if(bestMove.value[1][0] === tar_row && bestMove.value[1][1] === tar_col){
      members.push([tar_row,tar_col]);
      tar_row = 0;
      tar_col = 0;
    }
      return bestMove.move;
  }
    
//return isMoveOk;
//return {isMoveOk: isMoveOk, getExampleGame: getExampleGame};

  return {
    getInitialBoard: getInitialBoard,
    createMove: createMove,
    isMoveOk: isMoveOk,
    getExampleGame: getExampleGame,
    createComputerMove: createComputerMove

  };
  
});

}());







;(function(){

angular.module('myApp')
  .controller('Ctrl', 
    ['$scope', '$rootScope','$log', '$timeout',
       'gameService', 'stateService', 'gameLogic', 
       'aiService', 'resizeGameAreaService', '$translate',
    function ($scope, $rootScope, $log, $timeout,
        gameService, stateService, gameLogic, 
        aiService, resizeGameAreaService, $translate) {

    'use strict';
    resizeGameAreaService.setWidthToHeight(1);

    $scope.selectedPosition = [];
    var moveOri;
    var move;
    var isChain = false;
    var chainValue = [];
    var gameArea = document.getElementById("gameArea");
    var rowsNum = 17;
    var colsNum = 17;
    var draggingStartedRowCol = null; // The {row: YY, col: XX} where dragging started.
    var draggingStartedRowColInBoard = null; // The {row: YY, col: XX} where dragging started mapped to board
    var draggingPiece = null;
    var nextZIndex = 61;   
    var currentPiece = null;
    var draggingHole = null;
    var currentHole = null;
    var whitePlayer = 'O';
    var blackPlayer = 'X';


    $scope.map = [
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[3,13],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[4,13],[3.5,12],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[5,13],[4.5,12],[4,11],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[6,13],[5.5,12],[5,11],[4.5,10],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[0,0],[9,17],[8.5,16],[8,15],[7.5,14],[7,13],[6.5,12],[6,11],[5.5,10],[5,9],[4.5,8],[4,7],[3.5,6],[3,5],[0,0]],
    [[0,0],[0,0],[9.5,16],[9,15],[8.5,14],[8,13],[7.5,12],[7,11],[6.5,10],[6,9],[5.5,8],[5,7],[4.5,6],[4,5],[0,0]],
    [[0,0],[0,0],[0,0],[10,15],[9.5,14],[9,13],[8.5,12],[8,11],[7.5,10],[7,9],[6.5,8],[6,7],[5.5,6],[5,5],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[10.5,14],[10,13],[9.5,12],[9,11],[8.5,10],[8,9],[7.5,8],[7,7],[6.5,6],[6,5],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[11,13],[10.5,12],[10,11],[9.5,10],[9,9],[8.5,8],[8,7],[7.5,6],[7,5],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[12,13],[11.5,12],[11,11],[10.5,10],[10,9],[9.5,8],[9,7],[8.5,6],[8,5],[7.5,4],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[13,13],[12.5,12],[12,11],[11.5,10],[11,9],[10.5,8],[10,7],[9.5,6],[9,5],[8.5,4],[8,3],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[14,13],[13.5,12],[13,11],[12.5,10],[12,9],[11.5,8],[11,7],[10.5,6],[10,5],[9.5,4],[9,3],[8.5,2],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[15,13],[14.5,12],[14,11],[13.5,10],[13,9],[12.5,8],[12,7],[11.5,6],[11,5],[10.5,4],[10,3],[9.5,2],[9,1],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[13.5,8],[13,7],[12.5,6],[12,5],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[14,7],[13.5,6],[13,5],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[14.5,6],[14,5],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[15,5],[0,0]],
    [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],
    ];
    
    $scope.newposition = 50;
    $scope.newpositionTop = 50;
    $scope.setPagePosition = function(index, parentIndex) {
        $scope.newposition =  $scope.map[parentIndex][index][0] * 6.3 - 9 + '%'
        return $scope.newposition;
    }
    $scope.setPagePositionTop = function(parentIndex, index){
        $scope.newpositionTop = $scope.map[parentIndex][index][1] * 5.7 - 3.8 + '%'
        return $scope.newpositionTop;
    }   
    
    function resetAll(){
      $scope.ani_point = [];
      $scope.ul = false;
      $scope.ur = false;
      $scope.l = false;
      $scope.r = false;
      $scope.dl = false;
      $scope.dr = false;
      
      $scope.jul = false;
      $scope.jur = false;
      $scope.jl = false;
      $scope.jr = false;
      $scope.jdl = false;
      $scope.jdr = false;
      
    }

    function updateUI(params) {
      $scope.params = params;
      $scope.board = params.stateAfterMove.board;
      if ($scope.board === undefined) {
        $scope.board = gameLogic.getInitialBoard();
      }

      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;
      
      if(params.yourPlayerIndex === -2 ){
        //do nothing when initial state holds
      }else if(params.yourPlayerIndex === -1){
        //do nothing when end of game
      }else if(!$scope.isYourTurn && params.playersInfo[params.yourPlayerIndex].playerId !== ''){
        //setAll(params.move);  // show opponent's movement
      }

      // If the play mode is not pass and play then "rotate" the board
      // for the player. Therefore the board will always look from the
      // point of view of the player in single player mode...
      $scope.rotate = (params.playMode === "playBlack") ? true : false;
      
      if(isChain){
        makeGameMove(true);
        
      }else if ($scope.isYourTurn
          && params.playersInfo[params.yourPlayerIndex].playerId === '') {
          $timeout(function(){
            moveOri = gameLogic.createComputerMove($scope.board, $scope.turnIndex);
          makeGameMove(true);
          },300);    
      }   
    }
      
    window.handleDragEvent = handleDragEvent;

    function handleDragEvent(type, clientX, clientY) {
      // Center point in gameArea
      var x = clientX - gameArea.offsetLeft;
      var y = clientY - gameArea.offsetTop;
      var row, col;
      // Is outside gameArea?
      if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
        if (draggingPiece) {
          // Drag the piece where the touch is (without snapping to a square).
          var size = getSquareWidthHeight();
          setDraggingPieceTopLeft({top: y - size.height / 2, left: x - size.width / 2});
        } else {
          return;
        }
      } else {
        // Inside gameArea. Let's find the containing square's row and col      
        var row = Math.floor(rowsNum * y / gameArea.clientHeight);
        var col = (row % 2 === 0) ? Math.floor(colsNum * x / gameArea.clientWidth) : 
                      roundHalf(colsNum * x / gameArea.clientWidth);
        var r_row = rowsNum - row;
        var r_col = colsNum - col;
        var boardRowCol = findRowColInBoard(r_row, r_col);

        if (type === "touchstart" && !draggingStartedRowCol) {
          // drag started
          if (boardRowCol && $scope.board[boardRowCol.row][boardRowCol.col]) {            
            draggingStartedRowCol = {row: rowsNum + 1 - boardRowCol.row, col: colsNum + 1 - boardRowCol.col};
            draggingStartedRowColInBoard = boardRowCol;
            $log.info("dragging started from: ( " + JSON.stringify(boardRowCol) + " )");
            draggingPiece = document.getElementById("myPiece_" + 
              draggingStartedRowColInBoard.row + "x" + draggingStartedRowColInBoard.col);
            draggingHole = draggingPiece.parentNode;
            if ($scope.board[draggingStartedRowColInBoard.row][draggingStartedRowColInBoard.col] !== 'a') {
              draggingPiece.style['width'] = "150%";
              draggingPiece.style['height'] = "150%";
              draggingPiece.style['border-width'] = "4px";
              draggingPiece.style['border-style'] = "groove";
              draggingPiece.style['border-color'] = "yellow";
            }           
          }
        }
      }
      if (!draggingPiece) {
        return;
      }
      if (type === "touchend") {
        var from = draggingStartedRowColInBoard;
        var to = boardRowCol;
        dragDoneHandler(from, to);      
      } else {
        // Drag continue
        currentPiece = document.getElementById("myPiece_" + boardRowCol.row + "x" + boardRowCol.col);
        currentHole = currentPiece.parentNode;
        //console.log((parseFloat(currentHole.style.left) - parseFloat(draggingHole.style.left)) / 0.035 + '%');
        
        var deltaTop = (parseFloat(currentHole.style.top) - parseFloat(draggingHole.style.top)) / 0.035 - 100 + '%';
        var deltaLeft = (parseFloat(currentHole.style.left) - parseFloat(draggingHole.style.left)) / 0.035 - 100 + '%';

        draggingPiece.style.left = deltaLeft;
        draggingPiece.style.top = deltaTop;
        //setDraggingPieceTopLeft(getSquareTopLeft(rowsNum + 1 - boardRowCol.row, colsNum + 1 - boardRowCol.col));
        //var centerXY = getSquareCenterXY(rowsNum + 1 - boardRowCol.row, colsNum + 1 - boardRowCol.col);
      }
      if (type === "touchend" || type === "touchcancel" || type === "touchleave") {
        // drag ended
        // return the piece to it's original style (then angular will take care to hide it).
        setDraggingPieceTopLeft(getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col));         
        draggingPiece.style['border-width'] = "";
        draggingPiece.style['border-style'] = "";
        draggingPiece.style['border-color'] = "";
        draggingPiece.style['width'] = "100%";
        draggingPiece.style['height'] = "100%";
        draggingStartedRowCol = null;
        draggingStartedRowColInBoard = null;
        draggingPiece = null;
      }
    }

    function roundHalf(num) {
      return Math.round(num) - 0.5;
    }

    function findRowColInBoard(row, col) {
      var rowColInDragNDrop = [18 - col, 18 - row];
      for (var i = 0; i < $scope.map.length; i++) {
        var mapWithIndex = $scope.map[i];
        for (var j = 0; j < mapWithIndex.length; j++) {
          if (angular.equals(mapWithIndex[j], rowColInDragNDrop)) {
            return {row: i, col: j};
          }
        }
      }
      return null;
    }

    function setDraggingPieceTopLeft(topLeft) {
      var originalSize = getSquareTopLeft(draggingStartedRowCol.row, draggingStartedRowCol.col);
      draggingPiece.style.left = (topLeft.left - originalSize.left) + "%";
      draggingPiece.style.top = (topLeft.top - originalSize.top) + "%";
    }

    function getSquareWidthHeight() {
      return {
        width: 2 * gameArea.clientWidth / colsNum,
        height: 2 * gameArea.clientHeight / rowsNum
      };
    }

    function getSquareTopLeft(row, col) {
      var size = getSquareWidthHeight();
      return {top: row * size.height, left: col * size.width}
    }

    function getSquareCenterXY(row, col) {
      var size = getSquareWidthHeight();
      return {
        x: col * size.width + size.width / 2,
        y: row * size.height + size.height / 2
      };
    }

    function dragDone(from, to) {
      $rootScope.$apply(function () {
        dragDoneHandler(from, to);
      });
    }

    function dragDoneHandler(from, to) {
      var msg = "Dragged piece " + from.row + "x" + from.col + " to square " + to.row + "x" + to.col;
      $log.info(msg);
      // Update piece in board and make the move
      if (window.location.search === '?throwException') {
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (!$scope.isYourTurn) {
        return;
      }

      // need to rotate the angle if playblack
      if($scope.rotate) {
        from.row = rowsNum + 1 - from.row;
        from.col = colsNum + 1 - from.col;
        to.row = rowsNum + 1 - to.row;
        to.col = colsNum + 1 - to.col;
      }
      actuallyMakeMove(from, to);      
    }

    function actuallyMakeMove(from, to) {
      try {
        $scope.oldrow = from.row;
        $scope.oldcol = from.col;

        moveOri = gameLogic.createMove(from.row, from.col, to.row, to.col, $scope.turnIndex, $scope.board);
        $scope.isYourTurn = false; // to prevent making another move
        makeGameMove(true);
      } catch (e) {
        $log.info(["It is illegal to move position from:", $scope.oldrow, $scope.oldcol," to position:",to.row, to.col]);
        return;
      }
    }

    $scope.getCellTypeO = function(row, col) {
      if ($scope.rotate) {
        row = rowsNum + 1 - row;
        col = colsNum + 1 - col;
      }
      return $scope.board[row][col] === 'O';
      
    }

    $scope.getCellTypeX = function(row, col) {
      if ($scope.rotate) {
        row = rowsNum + 1 - row;
        col = colsNum + 1 - col;
      }
      return $scope.board[row][col] === 'X';
    }
    
    function setAll(move){
      resetAll();
      var row = move[2].set.value.row;
      var col = move[2].set.value.col;
      var oldrow = move[2].set.value.oldrow;
      var oldcol = move[2].set.value.oldcol;
      $scope.ani_point[0] = oldrow;
      $scope.ani_point[1] = oldcol;
      if(row === oldrow && col === oldcol + 1){
        // up left
        $scope.ul = true;
      }
      else if(row === oldrow + 1 && col === oldcol + 1){
        // up right
        $scope.ur = true;
      }
      else if(row === oldrow - 1 && col === oldcol){
        // left
        $scope.l = true;
      }
      else if(row === oldrow + 1 && col === oldcol){
        // right
        $scope.r = true;
      }
      else if(row === oldrow - 1 && col === oldcol - 1){
        // down left
        $scope.dl = true;
      }
      else if(row === oldrow && col === oldcol - 1){
        // down right
        $scope.dr = true;
      }
      else if(row === oldrow && col === oldcol + 2){
        // jump up left
        $scope.jul = true;
      }
      else if(row === oldrow + 2 && col === oldcol + 2){
        // jump up right
        $scope.jur = true;
      }
      else if(row === oldrow - 2 && col === oldcol){
        // jump left
        $scope.jl = true;
      }
      else if(row === oldrow + 2 && col === oldcol){
        // jump right
        $scope.jr = true;
      }
      else if(row === oldrow - 2 && col === oldcol - 2){
        // jump down left
        $scope.jdl = true;
      }
      else if(row === oldrow && col === oldcol - 2){
        // jump down right
        $scope.jdr = true;
      }
        
    }
    
    function isNotSelectable(row, col){
      var possibleMoves = [];
      var i, j;
      var tempMove;
      for(i = 1; i < 19; i++){
        for(j = 1; j < $scope.board[i].length; j++){
          try{
            tempMove = gameLogic.createMove(row, col, i, j, $scope.turnIndex, $scope.board);
            possibleMoves.push([i,j]);
          }catch(e){
            // $log.error(e);
          }
        }
      }
      if(possibleMoves.length === 0){
        return true;
      }else{
        return false;
      }
    }
       
    // pay attantion to WIN condition: endMatch
    function makeGameMove(isDnD){
      
        move = angular.copy(moveOri);
        isChain = angular.copy(moveOri[3].set.value);
      
        if(isChain && chainValue.length === 0){
          chainValue = angular.copy(moveOri[4].set.value);  // initial chainValue when first meet
        }
        if(isChain && chainValue.length > 2 && move[0].setTurn === undefined){  // end Match
          move[0] = {setTurn:{turnIndex: $scope.turnIndex}};
        }
        if(isChain && chainValue.length > 2 && move[0].setTurn !== undefined){  // normal
          move[0].setTurn.turnIndex = $scope.turnIndex;
        } 
        if(isChain){  // change the shape of move
          var row = move[2].set.value.row;
          var col = move[2].set.value.col;
          move[1].set.value[row][col] = 'a';
          move[1].set.value[chainValue[1][0]][chainValue[1][1]] = $scope.turnIndex===0? 'O' : 'X';
          move[1].set.value[chainValue[0][0]][chainValue[0][1]] = 'a';
          move[2].set.value.oldrow = chainValue[0][0];
          move[2].set.value.oldcol = chainValue[0][1];
          move[2].set.value.row = chainValue[1][0];
          move[2].set.value.col = chainValue[1][1];
        }
        if(chainValue.length > 2){
          chainValue.reverse();
          chainValue.pop();
          chainValue.reverse(); 
        }else{
          moveOri[3].set.value = false;
          move[0] = moveOri[0];
          isChain = false;
          chainValue = [];
        }
        setAll(move); 
        $timeout(function(){
          console.log("timeout! ");
          gameService.makeMove(move);},500);       
    }
    
    gameService.setGame({
      gameDeveloperEmail: "xzzhuchen@gmail.com",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
    
   
  }]);

})();;angular.module('myApp').factory('aiService',
    ["alphaBetaService", "gameLogic",
      function(alphaBetaService, gameLogic) {

  'use strict';

  /**
   * Returns the move that the computer player should do for the given board.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  function createComputerMove(startingState, playerIndex, alphaBetaLimits) {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    // Recal that a TicTacToe move has 3 operations:
    // 0) endMatch or setTurn
    // 1) {set: {key: 'board', value: ...}}
    // 2) {set: {key: 'delta', value: ...}}]
    return alphaBetaService.alphaBetaDecision(
        [null, {set: {key: 'board', value: startingState.board}},
          {set: {key: 'isUnderCheck', value: startingState.isUnderCheck}},
          {set: {key: 'canCastleKing', value: startingState.canCastleKing}},
          {set: {key: 'canCastleQueen', value: startingState.canCastleQueen}},
          {set: {key: 'enpassantPosition', value: startingState.enpassantPosition}}],    // startingState
        playerIndex, getNextStates, getStateScoreForIndex0,
        // If you want to see debugging output in the console, then surf to game.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null,
        alphaBetaLimits);
  }

  function getStateScoreForIndex0(move) { // alphaBetaService also passes playerIndex, in case you need it: getStateScoreForIndex0(move, playerIndex)
    if (move[0].endMatch) {
      var endMatchScores = move[0].endMatch.endMatchScores;
      return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
          : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
          : 0;
    }
    return 0;
  }

  function getNextStates(move, playerIndex) {
    var board = move[1].set.value,
        isUnderCheck = move[2].set.value,
        canCastleKing = move[3].set.value,
        canCastleQueen = move[4].set.value,
        enpassantPosition = move[5].set.value;
    var possibleDeltas = gameLogic.getPossibleMoves(board, playerIndex, isUnderCheck,
        canCastleKing, canCastleQueen, enpassantPosition);
    var possibleMoves = [];
    for (var i = 0; i < possibleDeltas.length; i++) {
      var deltaFromAndTos = possibleDeltas[i];
      var deltaFrom = deltaFromAndTos[0],
          deltaTos = deltaFromAndTos[1];
      for (var j = 0; j < deltaTos.length; j++) {
        var deltaTo = deltaTos[j];
        try {
          console.log("going to create move: " + JSON.stringify(deltaFrom) + " --> " + 
            JSON.stringify(deltaTo));
          possibleMoves.push(gameLogic.createMove(board, deltaFrom, deltaTo, playerIndex,
            isUnderCheck, canCastleKing, canCastleQueen, enpassantPosition));
        } catch (e) {
          // cannot create move with this possible delta, should continue
        }
      }     
    }
    return possibleMoves;
  }

  function getDebugStateToString(move) {
    return "\n" + move[1].set.value.join("\n") + "\n";
  }

  return {createComputerMove: createComputerMove};
}]);
/*
var CSTdiagram;
var total;
function printTree(tree){
    CSTdiagram = new Array();
    putMessage("CST:");
    tree.refresh();
    total = tree.spaceNeeded;
    buildTree(tree, 0);
    
    for(var i =0; i < CSTdiagram.length; i++){//Go through every level of the tree
        var output = "";
        for(var j=0;j<total;j++){//Go all the way through every column
            if(CSTdiagram[i][j] == undefined){
                output += "           ";
            }
            else
                output += CSTdiagram[i][j];
        }
        output += "\n";
        document.getElementById("taOutput").value += output;
    }
}

function buildTree(tree, level){
    var numChildren = tree.children.length;
    var remainder = numChildren % 2;
    var halfWay = (numChildren - remainder) / 2;
    var offset =0;
    
    //putMessage("numChildren ="+numChildren+" remainder: "+remainder+" halfway= "+halfWay+" spaceneeded: "+tree.spaceNeeded+" level: "+level);
    if(remainder == 0){ //Even number of children
        for(var i =0;i<halfWay; i++){
            offset = offset+tree.children[i].spaceNeeded;
        }
    }
    else{ //Odd number of children
        for(var i=0;i<halfWay;i++){
            offset = offset+tree.children[i].spaceNeeded;
        }
        offset = offset+Math.floor(tree.children[halfWay].spaceNeeded/2);
    }
    
    if((CSTdiagram.length+1) >level){
        var newLine = new Array();
        for(var i =0; i<total;i++){
            newLine.push("                ");
        }
        CSTdiagram.push(newLine);
    }
    var branch = "";
    if(tree.type.length < 16){
        var padding = "";
        for(var i=0;i<(16-type.length)/2;i++){
            padding += " ";
        }
        branch = (padding+tree.type+padding);
    }
    else
        branch = tree.type;
    CSTdiagram[level][offset] = branch;
    for(var i=0; i<numChildren;i++){
        buildTree(tree.children[i],level+1);
    }
}*/

function printTree(tree){
    var parseReturnText = simplePrintTree(tree,0);
	putMessage(parseReturnText);
}

function simplePrintTree(tree, indent){
    var result = "";
	//Generate the proper offset
	for(var i=0;i<indent;i++)
		result += "  ";
	
	var root = tree.type;
	   
	if(/userId|type|digit|char$|string/.test(root))//This is one of the tokens with extra information
		result += "[" + root + "]---"+tree.token.inside+"\n";
	else
		result += "[" + root + "]\n";

	if(tree.children.length > 0) //This is not a token leaf
	{
		for(var i=0;i<tree.children.length;i++)
				result += simplePrintTree(tree.children[i],indent+1);
	}
	
	return result;
}


function printSymbolTable()
{
	var identifiers = symTable.keys();
	var varObjs = symTable.values();
    var returnText ="";
	
	returnText +="Symbol Table:\n";
	returnText +="Identifier |Type        |Value\n";
	
	for(var i=0;i<identifiers.length;i++){
			returnText +=""+identifiers[i] + "           "+ varObjs[i].type +"     " +varObjs[i].value.type+"\n";
	}
    putMessage(returnText);
}

	

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



function simplePrintTree(tree, indent){
    var result = "";
	//Generate the proper offset
	for(var i=0;i<indent;i++)
		result += "  ";
	
	var root = tree.type;
	   
	if(/userId|type|digit|char$|string$|bool$/.test(root))//This is one of the tokens with extra information
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


function printSymbolTable(tree, number)
{
	var identifiers = tree.symTable.keys();
	var varObjs = tree.symTable.values();
	var returnText = "";

    if(identifiers.length > 0){
        returnText += "-Scope "+number+"-\n"
    	for(var i=0;i<identifiers.length;i++){
    		returnText +=""+varObjs[i].name + "           ";
            returnText += varObjs[i].alias;
            if(varObjs[i].alias.length < 7){
                for(var j=0;j<7-varObjs[i].alias.length;j++)
                   returnText += " ";
            }
            returnText += varObjs[i].type;
            if(varObjs[i].type.length < 10){
                for(var j=0;j<10-varObjs[i].type.length;j++)
                   returnText += " ";
            }
            var position = varObjs[i].line+":"+varObjs[i].column
            returnText += position;
            returnText +="\n";
    	}
    returnText +="\n";
    }
    
    for (var i = 0; i < tree.children.length; i++) {
        returnText += printSymbolTable(tree.children[i], (number*10+1)+i)
    }
    
    return returnText;
    
}

	

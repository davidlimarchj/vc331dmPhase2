//Prints the completed Parse Tree
function printParseTree(){
	var parseReturnText = "\nParse Tree: \n" + printTree(tree,0);
	putMessage(parseReturnText);
}
   
   
function printTree(tree, indent)
   {
	var result = "";
	//Generate the proper offset
	for(var i=0;i<indent;i++)
		result += "  ";
	
	var root = tree.type;
	   
	if(/userId|type|digit|char/.test(root))//This is one of the tokens with extra information
		result += "[" + root + "]---"+tree.inside+"\n";
	else
		result += "[" + root + "]\n";

	if(!/T_*/.test(root)) //This is not a token leaf
	{
		//Recursively collect the rest of the tree
		switch (root) {
			case "B_program":
				result += printTree(tree.statement,indent+1);
				break;
			case "B_printState":
				result += printTree(tree.expr,indent+1);
				break;
			case "B_idState":
				result += printTree(tree.id,indent+1);
				result += printTree(tree.expr,indent+1);
				break;
			case "B_varDecl":
				result += printTree(tree.kind,indent+1);
				result += printTree(tree.id,indent+1);
				break;
			case "B_statementList":
				if(tree.size > 0)//this isn't the empty list
				{
					result += printTree(tree.statement,indent+1);
					result += printTree(tree.statementList,indent+1);
				}
				break;
			case "B_intExpr":
				result += printTree(tree.inner,indent+1);
				break;
			case "B_intExprWOp":
				result += printTree(tree.digitT,indent+1);
				result += printTree(tree.op,indent+1);
				result += printTree(tree.expr,indent+1);
				break;
			case "B_charList":
				if(tree.size > 0)//this isn't the empty list
				{
					result += printTree(tree.charT,indent+1);
					result += printTree(tree.charList,indent+1);
				}
				break;
			case "B_id":
				result += printTree(tree.idT,indent+1);
				break;
			case "B_error":
				break;
			default:
				result += "[???]";
				break;
		}
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
	

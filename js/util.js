function changeObjective(model, obj) {
	model.objective = model.getReactionById('R_'+obj[0]);
}

function changeRxnBounds(model, rid, val, bounds) {
	switch (bounds) {
	case 'l'	:	model.getReactionById('R_'+rid).lower = val; break;
	case 'u'	:	model.getReactionById('R_'+rid).upper = val; break;
	case 'b'	:	model.getReactionById('R_'+rid).lower = val;
					model.getReactionById('R_'+rid).upper = val;
	}
}

function makeAutotrophic(model, photons, co2) {
	/*
	% to run auto, run the following set of commands after activating Cobra
	% and reading the model*/
	changeObjective(model,['Ec_biomass_SynAuto']);
	changeRxnBounds (model,'Ec_biomass_SynHetero',0,'b');
	changeRxnBounds (model,'Ec_biomass_SynMixo',0,'b');
	changeRxnBounds(model,'EX_photon_LPAREN_e_RPAREN_',photons,'l');
	changeRxnBounds(model,'EX_glc_LPAREN_e_RPAREN_',0,'b');
	/*%Assumed no excretion of CO2 under autotrophic conditions*/
	changeRxnBounds (model,'EX_hco3_LPAREN_e_RPAREN_',-co2,'l');
	changeRxnBounds (model,'EX_co2_LPAREN_e_RPAREN_',0,'b');
	changeRxnBounds (model,'H2CO3_NAt_syn',0,'u');

	/*%Remove NADH, periplasmic, and cytochrome c6 reactions
	%Constraining cytochrome c6-dependent reactions.*/
	changeRxnBounds(model,'CBFC2ub',0,'b');
	changeRxnBounds(model,'CBFC2pb',0,'b');
	changeRxnBounds(model,'CYO1b_syn',0,'b');
	changeRxnBounds(model,'CYO1bpp_syn',0,'b');
	changeRxnBounds(model,'PSI_2a',0,'b');

	/*%Constraining NADH dependent reactions*/
	changeRxnBounds(model,'NDH2_1p',0,'b');
	changeRxnBounds(model,'NDH2_syn',0,'b');

	/*%Constraining periplasmic reactions.*/
	changeRxnBounds(model,'NDH1_1p',0,'b');
	changeRxnBounds(model,'CYO1b2pp_syn',0,'b');
	changeRxnBounds(model,'CBFCpb',0,'b');
	changeRxnBounds(model,'CYTBDpp',0,'b');
	changeRxnBounds(model,'SUCDyy_syn',0,'b');
	changeRxnBounds(model,'FDH6pp',0,'b');
	changeRxnBounds(model,'G3PDap',0,'b');
	changeRxnBounds(model,'PROD5p',0,'b');

	changeRxnBounds(model,'FDH6',0,'b');
	changeRxnBounds(model,'PROD5u',0,'b');
	changeRxnBounds(model,'G3PDau',0,'b');

	/*%Assumed irreversibility of ferredoxin NADPH reductase under autotrophic
	%conditions.*/
	changeRxnBounds(model,'FNOR',0,'l');

	/*%Assuming active oxygenase and plant-like serine pathway both are on*/
	changeRxnBounds(model,'3PGDH',0.0420,'u'); //%Serine pathway
	/*%  changeRxnBounds(model,'RBCh',0.1154,'b');
	%  changeRxnBounds(model,'3PGDH',0,'b');*/

	/*
	%Constraining other AEFs*/
	  //changeRxnBounds(model,'H2ASE_syn',0,'b');
	  //changeRxnBounds(model,'MEHLER',0,'b');
	  //changeRxnBounds(model,'NDH1_1u',0,'b');
	  //changeRxnBounds(model,'NDH1_3u',0,'b');
	  //changeRxnBounds(model,'NDH2_syn',0,'b');
	  //changeRxnBounds(model,'CYTBDu',0,'b');
	  //changeRxnBounds(model,'CYO1b2_syn',0,'b');
	  //changeRxnBounds(model,'FQRa',0,'b');
	  //changeRxnBounds(model,'SUCDu_syn',0,'b');
	  //changeRxnBounds(model,'SOPSI',0,'b');
	  //changeRxnBounds(model,'SOPSII',0,'b');

}

exports.makeAutotrophic = makeAutotrophic;


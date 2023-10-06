from datetime import datetime


class api:
	def __getDate(self):
		#Wed Oct 04 2023 17:21:03 GMT+0200 (Ora legale dell’Europa centrale)
		return datetime.now().strftime("%a %b %d %Y %H:%M:%S GMT+0200 (Ora legale dell’Europa centrale)")
	
	def __request(self, uri):
		pass

	def __getUri(self, idStazione):
		date = self.__getDate()
		partenza ='http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/partenze/'+idStazione+'/'+date
		arrivo = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/arrivi/'+idStazione+'/'+date

		andamento = 'http://www.viaggiatreno.it/viaggiatrenonew/resteasy/viaggiatreno/andamentoTreno/S00245/100/2017-10-04'

		
	
	
		#http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/andamentoTreno/S00245/Wed Oct 04 2023 17:21:03 GMT+0200 (Ora legale dell’Europa centrale)
		
	def getInfoCirc(self):
		# GET /resteasy/viaggiatreno/infomobilitaTicker/
		pass

	def getPartenze(self, idStazione):
		# GET /resteasy/viaggiatreno/partenze/{codiceStazione}/{orario}
		pass

	def getArrivi(self, idStazione):
		# GET /resteasy/viaggiatreno/arrivi/{codiceStazione}/{orario}
		pass

	def getAndamento(self, idTreno):
		# GET /resteasy/viaggiatreno/andamentoTreno/{codOrigine}/{numeroTreno}/{dataPartenza}
		pass

	def soluzioneViaggio(self, partenza, arrivo, data, ora):
		# GET /resteasy/viaggiatreno/soluzioniViaggioNew/{codLocOrig}/{codLocDest}/{date}
		pass

	def searchStazione(self, nomeStazione):
		# GET /resteasy/viaggiatreno/cercaStazione/{text}
		pass

	def getStazioniByRegione(self, regione):
		# GET /resteasy/viaggiatreno/elencoStazioni/{regione}
		pass


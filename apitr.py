from datetime import datetime


class api:
	def __getDate(self):
		#Wed Oct 04 2023 17:21:03 GMT+0200 (Ora legale dell’Europa centrale)
		return datetime.now().strftime("%a %b %d %Y %H:%M:%S GMT+0200 (Ora legale dell’Europa centrale)")
	
	def __getUri(self, idStazione):
		date = self.__getDate()
		partenza ='http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/partenze/'+idStazione+'/'+date
		arrivo = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/arrivi/'+idStazione+'/'+date

		andamento = 'http://www.viaggiatreno.it/viaggiatrenonew/resteasy/viaggiatreno/andamentoTreno/S00245/100/2017-10-04'

		
	
	
		#http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno/andamentoTreno/S00245/Wed Oct 04 2023 17:21:03 GMT+0200 (Ora legale dell’Europa centrale)
		
	def getInfoStazione(self, idStazione):
		pass

	def getPartenze(self, idStazione):
		pass

	def getArrivi(self, idStazione):
		pass

	def getAndamento(self, idTreno):
		pass

	def soluzioneViaggio(self, partenza, arrivo, data, ora):
		pass

	def getStazioniByRegione(self, regione):
		pass


opus.Gizmo({
	name: "main",
	dropTarget: true,
	type: "Palm.Mojo.Panel",
	h: "100%",
	styles: {
		zIndex: 2
	},
	components: [
		{
			name: "gnews",
			onSuccess: "newsHandler",
			onFailure: "errorNews",
			url: "http://ajax.googleapis.com/ajax/services/search/news",
			parametersString: "v=1.0&rsz=large&topic=h",
			parameters: {},
			handleAs: "json",
			type: "Palm.Mojo.WebService"
		}
	]
});
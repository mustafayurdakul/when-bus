import React from "react";

function SharePage() {
	return (
		<div className="flex flex-row items-center justify-center border-t border-b border-neutral-200 dark:border-neutral-800 py-4">
			<div className="mr-4 bg-white dark:bg-neutral-300 p-2 rounded shadow">
				<img src={require("../assets/Code.png")} alt="Share" className="w-48" />
			</div>
			<div className="flex flex-col text-xs">
				<span className="mb-2">
					Bu uygulama Mustafa Yurdakul tarafından yapılmıştır. Kaynak kodlarına <a className="text-blue-700" href="https://github.com/mustafayurdakul/when-bus">GitHub</a> üzerinden ulaşabilirsiniz.
				</span>
				<span className="mb-2">
					<a href="https://mustafayurdakul.github.io/when-bus/" className="text-neutral-700"
					>mustafayurdakul.github.io/when-bus</a>
				</span>
				<span>
					<a href="mailto:mustafa@yurdakul.dev" className="text-neutral-700"
					>mustafa@yurdakul.dev</a>
				</span>
			</div>
		</div>
	);
}

export default SharePage;
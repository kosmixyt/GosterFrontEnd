export function UserLanding() {
    return <div className="flex flex-col justify-center mt-12 h-full">
        <div className="text-3xl text-center underline">Me</div>
        <div className="flex justify-center mt-14">
            <div className="bg-slate-800 text-center w-1/2 flex flex-col rounded-lg pt-4 pb-4">
                <div className="">Stats :</div>
                <div className="mt-4">Téléchargement:</div>
                <div className="mt-2">Media téléchargé : 0/100 (0%)</div>
                <div className="mt-2">Espace utilisé : 1GO/100GO (1%)</div>
                <div className="mt-2">Torrent Actif : 1 </div>
                <div className="mt-4">Demande : </div>
                <div className="mt-2">Film demandé : 0</div>
                <div className="mt-2">Saison demandé : 0</div>
                <div className="mt-4">Transcodage : </div>
                <div className="mt-2">Transcodage utilisé 1/100 (100%)</div>
                <div className="mt-2">Partage : </div>
                <div className="mt-2">Partage utilisé 1/100 (100%)</div>
                <div className="mt-4">Partage Actif 1/10 (10%)</div>
            </div>
        </div>
    </div>;
}
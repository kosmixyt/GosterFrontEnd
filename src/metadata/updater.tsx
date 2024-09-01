import { GENRE } from "../component/poster";
import { Provider } from "../component/contentprovider/contentprov";
import { useEffect, useState } from "react";
import { app_url } from "..";
import { createPortal } from "react-dom";
import { IoIosCloseCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";

// function UpdateItem(props: { update: EditableMovie | EditableTv }) {

// }

export function Updater(props: { movieId?: number; serieId?: number, close: () => void }) {
    const nav = useNavigate()
    const [updateData, setUpdateData] = useState<null | UpdateData>(null)
    const [editableMovie, setEditableMovie] = useState<EditableMovie | EditableTv | null>(null)
    useEffect(() => {
        fetch(`${app_url}/metadata/info`, { credentials: 'include' })
            .then((res) => res.json())
            .then(setUpdateData)
        fetch(`${app_url}/metadata/${props.movieId ? `movie/` : `tv/`}info?id=${(props.movieId || 0) + (props.serieId || 0)}`, { credentials: 'include' })
            .then((res) => res.json())
            .then(setEditableMovie)
    }, [])
    console.log(updateData, editableMovie)
    if (!updateData || !editableMovie) return <div></div>
    return createPortal(
        <div className="h-full w-full fixed z-20 backdrop-blur-lg top-0 left-0">
            <div className="relative md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-stone-900 h-full w-full  md:w-7/12 md:h-[90%] rounded-lg ">
                <div className="h-full w-full">
                    <div className="h-[55%] overflow-auto">
                        <div className="flex justify-center h-12 items-center">
                            <div className="align-middle text-2xl">
                                <div>Modification des métadonées</div>
                                <a href={`https://www.themoviedb.org/${props.movieId ? "movie" : "tv"}/${editableMovie.tmdb_id}`}>TMDB ID : {editableMovie.tmdb_id}</a>
                            </div>
                            <button className="ml-2 align-middle" onClick={props.close}>
                                <IoIosCloseCircle size={40} />
                            </button>
                        </div>
                        <div className="flex justify-center flex-col text-center ">
                            <div className="text-xl focus:outline-none m-4">
                                <input placeholder="Name"
                                    value={editableMovie.name}
                                    onChange={(e) => setEditableMovie({ ...editableMovie, name: e.target.value })}
                                    className="pl-1"
                                    type="text"
                                />
                            </div>
                            <div className="text-xl focus:outline-none m-4">
                                <input
                                    onChange={(e) => setEditableMovie({ ...editableMovie, original_Name: e.target.value })}
                                    value={editableMovie.original_Name || ""}
                                    placeholder="Original Name"
                                    className="pl-1"
                                    type="text"
                                />
                            </div>
                            <div className="text-xl focus:outline-none m-4">
                                <input
                                    onChange={(e) => setEditableMovie({ ...editableMovie, year: e.target.value })}
                                    placeholder="Year"
                                    className="pl-1"
                                    value={editableMovie.year}
                                    type="text"
                                />
                            </div>

                            <div className="text-sm focus:outline-none m-4">
                                <textarea
                                    className="w-full h-36"
                                    placeholder="Description"
                                    onChange={(e) => setEditableMovie({ ...editableMovie, description: e.target.value })}
                                    value={editableMovie.description}></textarea>
                            </div>
                            <div className="text-xl focus:outline-none m-4 flex justify-center">
                                <input placeholder="Runtime"
                                    value={editableMovie.runtime}
                                    className="pl-1"
                                    onChange={(e) => setEditableMovie({ ...editableMovie, runtime: parseInt(e.target.value) })}
                                    type="number"
                                /> <div className="ml-2">min</div>
                            </div>
                        </div>
                    </div>
                    <div className="h-[20%]">
                        <ChooseProviders
                            add={(e) => {
                                setEditableMovie({
                                    ...editableMovie, providers: [...editableMovie.providers, e.PROVIDER_ID]
                                })
                            }}
                            delete={(e) => {
                                setEditableMovie({
                                    ...editableMovie, providers: editableMovie.providers.filter((f) => f != e.PROVIDER_ID)
                                })
                            }}
                            defaultSelected={editableMovie.providers} aproviders={updateData.Providers} />
                    </div>
                    <div className="h-[20%]">
                        <ChooseGenre
                            add={(e) => {
                                setEditableMovie({
                                    ...editableMovie, genre: [...editableMovie.genre, e.ID]
                                })
                            }}
                            delete={(e) => {
                                setEditableMovie({
                                    ...editableMovie, genre: editableMovie.genre.filter((f) => f != e.ID)
                                })
                            }}
                            defaultSelected={editableMovie.genre} agenres={updateData.Genres} />
                    </div>
                    <div className="h-[5%] w-full flex justify-center">
                        <button className="">Submit</button>
                    </div>
                </div>


            </div></div >
        , document.body)
}

export function ChooseProviders(props: {
    aproviders: Provider[],
    defaultSelected: number[],
    add: (n: Provider) => void
    delete: (n: Provider) => void
}) {
    const nav = useNavigate()
    return <div className="flex w-full h-full">
        <div className="w-1/2 overflow-auto">
            <div className="text-center text-xl underline mb-1">Providers</div>
            <div className="flex flex-wrap gap-1">
                {props.defaultSelected.map((e, i) => {
                    const provider = props.aproviders.find((p) => p.PROVIDER_ID === e)
                    if (!provider) return <a>Provider not found </a>
                    return <img
                        src={provider.URL}

                        key={i}
                        onClick={() => {
                            // setSelected(selected.filter((s) => s !== e))
                            props.delete(provider)
                        }}
                        className="h-16 w-16 rounded-lg cursor-pointer"
                    />
                })}
            </div>
        </div>
        <div className="w-1/2 overflow-auto">
            <div className="text-center text-xl underline mb-1">Available Providers</div>
            <div className="flex flex-wrap gap-1">
                {props.aproviders.filter((e) => !props.defaultSelected.includes(e.PROVIDER_ID)).map((provider, i) => (
                    <img
                        onClick={(e) => {
                            props.add(provider)
                        }}
                        src={provider.URL}
                        key={i}
                        className="h-16 w-16 rounded-lg cursor-pointer"
                    />
                ))}
            </div>
        </div>
    </div>
}


export function ChooseGenre(props: {
    agenres: GENRE[]
    className?: string
    defaultSelected: number[],
    add: (n: GENRE) => void
    delete: (n: GENRE) => void
}) {
    const a = props.defaultSelected.map((e, i) => {
        const genre = props.agenres.find((p) => p.ID === e)
        if (!genre) return <div>GENRE NOT FOUND</div>
        return (<div
            onClick={() => props.delete(genre)}
            key={i}
            className="rounded-lg cursor-pointer bg-stone-700 p-1">
            {genre.NAME}
        </div>)
    })
    const b = props.agenres.filter((e) => !props.defaultSelected.includes(e.ID)).map((genre, i) => (
        <div

            onClick={(e) => props.add(genre)}
            key={i}
            className={`rounded-lg cursor-pointer bg-stone-700 p-1 ${props.className}`}>{genre.NAME}</div>
    ))
    return <div className="flex w-full h-full">
        <div className="w-1/2 overflow-auto">
            <div className="text-center text-xl underline mb-1">Genres</div>
            <div className="flex flex-wrap gap-1">
                {a}
            </div>
        </div>
        <div className="w-1/2 overflow-auto">
            <div className="text-center text-xl underline mb-1">Available Genres</div>
            <div className="flex flex-wrap gap-1">
                {b}
            </div>
        </div>
    </div>

}

export interface UpdateData {
    Genres: GENRE[]
    Keywords: Keywords[]
    Providers: Provider[]
}
export interface Keywords {
    NAME: string
    ID: string
}
export interface EditableMovie {
    name: string
    original_Name: string
    year: string
    description: string
    runtime: number
    tmdb_id: number
    trailer_Url: string
    genre: number[]
    keywords: number[]
    providers: number[]
}
export interface EditableTv {
    name: string
    original_Name: string
    year: string
    description: string
    runtime: number
    tmdb_id: number;
    trailer_Url: string
    genre: number[]
    keywords: number[]
    providers: number[]
}
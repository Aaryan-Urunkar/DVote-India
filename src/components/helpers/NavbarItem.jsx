import "../css/Navbar.css";

export const Item = (props) => {

    return (
        <span className="nav_text">
                <a href={`/${props.path}`}>{props.option}</a>
        </span>
    )
}
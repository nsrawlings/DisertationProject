﻿

class TableCloumn extends React.Component {
    render() {

        return (
            <div>
                <AssignedExeriseTable url="/assignedexerise" pollInterval={2000}></AssignedExeriseTable>
            </div>
        )
    }
}

class AssignedExeriseTable extends React.Component {
    firstTime = true;
    constructor(props) {
        super(props);
        this.state = { data: [], filteredData: [], searchType: 'name'};

        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchTypeChange = this.handleSearchTypeChange.bind(this);
    }
    loadExerisesFromServer() {
        const xhr = new XMLHttpRequest();
        xhr.open('get', this.props.url, true);
        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            this.setState({
                data: data,
            });
            if (this.firstTime) {
                this.setState({
                    filteredData: data
                });
                this.firstTime = false;
            }
        };
        xhr.send();
    }
    componentDidMount() {
        this.loadExerisesFromServer();
        window.setInterval(
            () => this.loadExerisesFromServer(),
            this.props.pollInterval,
        );
    }

    handleSearchTypeChange(e) {
        this.setState({ searchType: e.target.value });
    }

    //Handles the search change
    handleSearchChange(e) {
        var currentList = [];
        var newList = [];
        var lc = '';

        // If the search bar isn't empty
        if (e.target.value !== "") {
            // Assign the original list to currentList
            currentList = this.state.data;

            //.filter() to serach for key term dictated by seracg
            //Select case for chaning which value to search on.
            newList = currentList.filter(item => {
                if (this.state.searchType == "name") {
                    lc = item.Name.toLowerCase();
                }
                if (this.state.searchType == "type") {
                    lc = item.Type.toLowerCase();
                }
                //Name by defualt
                else {
                    const lc = item.Name.toLowerCase();
                }
                // change search term to lowercase
                const filter = e.target.value.toLowerCase();
                // check to see if the current list item includes the search term
                // If it does, it will be added to newList. Using lowercase eliminates
                // issues with capitalization in search terms and search content
                return lc.includes(filter);
            });
        } else {
            // If the search bar is empty, set newList to original task list
            newList = this.state.data;
        }
        // Set the filtered state based on what our rules added to newList
        this.setState({
            filteredData: newList
        });
    }

    //Take data and map it to rows then pass back back to main render fucntion
    renderRow() {
        return this.state.filteredData.map((exercises, index) => {
            if (exercises.ImageData != null) {
                const data = exercises.ImageData;
                const Example = ({ data }) => <img src={`data:image/jpeg;base64,${data}`} height="75" width="100"  />
                return (
                    <tr key={exercises.Exercises_ID}>
                        <td>{exercises.Name}</td>
                        <td><Example data={data} /></td>
                        <td>{exercises.Description}</td>
                        <td>{exercises.Type}</td>
                        <td>{exercises.Sets}</td>
                        <td>{exercises.Repetitions}</td>
                    </tr>
                )
            }
            else {
                return (
                    <tr key={exercises.Exercises_ID}>
                        <td>{exercises.Name}</td>
                        <td>No Image Found</td>
                        <td>{exercises.Description}</td>
                        <td>{exercises.Type}</td>
                        <td>{exercises.Sets}</td>
                        <td>{exercises.Repetitions}</td>
                    </tr>
                )
            }
        })
    }
    // Main Render Function
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-sm">
                        <label htmlFor="searchOptions" className="row row-form-label">Search By</label>
                    </div>
                    <div className="col-sm">
                    </div>
                </div>
                <div className="row">
                        <select className="form-control" id="searchOptions" onChange={this.handleSearchTypeChange}>
                            <option value="name">Name</option>
                            <option value="type">Type</option>
                        </select>
                        <input type="text" className="input" onChange={this.handleSearchChange} placeholder="Search..." /> 
                </div>
                <table className="table table-striped table-bordered table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Image</th>
                            <th scope="col">Description</th>
                            <th scope="col">Type</th>
                            <th scope="col">Sets</th>
                            <th scope="col">Repetitions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRow()}
                    </tbody>
                </table>
            </div>
            
        );
    }
}
ReactDOM.render(<TableCloumn />, document.getElementById('content'));
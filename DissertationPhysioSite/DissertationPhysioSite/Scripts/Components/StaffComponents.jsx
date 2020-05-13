class ButtonList extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            admin: false,
            opened: "AssignedPatienets",
        };
        this.handleAssignedPatienetsClick = this.handleAssignedPatienetsClick.bind(this);
        this.handleExercisesClick = this.handleExercisesClick.bind(this);
        this.handleStaffClick = this.handleStaffClick.bind(this);
        this.handleTestClick = this.handleTestClick.bind(this);
    }
    componentDidMount() {
        this._isMounted = true;
        this.getRoleFromServer();
        window.setInterval(
            () => this.getRoleFromServer(),
            2000,
        );
    }

    getRoleFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', "/getrole", true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                if (data == "Admin") {
                    this.setState({
                        admin: true
                    });
                }
            };
            xhr.send();
        }
    }

    handleAssignedPatienetsClick = () => {
        const { opened } = this.state;
        this.setState({
            opened: "AssignedPatienets",
        });
    }

    handleExercisesClick = () => {
        const { opened } = this.state;
        this.setState({
            opened: "Exercises",
        });
    }

    handleStaffClick = () => {
        const { opened } = this.state;
        this.setState({
            opened: "Staff",
        });
    }

    handleTestClick = () => {
        const { opened } = this.state;
        this.setState({
            opened: "Test",
        });
    }

    render() {
        return (
            <div className="row">
                <div id="Buttons" className="col-md-1">
                    <div className="btn-group-vertical mr-2" role="group" aria-label="First group">
                        <button type="button" className="btn btn-primary" onClick={this.handleAssignedPatienetsClick}>My Patients</button>
                        <button type="button" className="btn btn-primary" onClick={this.handleExercisesClick}>Exercises</button>
                        {this.state.admin ? <button type="button" className="btn btn-primary" onClick={this.handleTestClick}>Patients</button> : null}
                        {this.state.admin ? <button type="button" className="btn btn-primary" onClick={this.handleStaffClick}>Staff</button> : null}
                    </div>
                </div>
                
                <div id="tables" className="col-lg-10">
                    <TableCloumn data={this.state}> </TableCloumn>
                </div>
            </div>
        );
    }
}

class TableCloumn extends React.Component {
    render() {
        const opened = this.props.data.opened;
        if (opened == "AssignedPatienets") {
            return (
                <div>
                    <AssignedPatients pollInterval={2000}></AssignedPatients>
                </div>
            );
        }
        if (opened == "Exercises") {
            return (
                <div>
                    <ExeriseTable admin={this.props.data.admin} pollInterval={2000}></ExeriseTable>
                </div>
            );
        }
        if (opened == "Staff") {
            return (
                <div>
                    <StaffTable url="/staffquerry" pollInterval={2000} admin={this.props.data.admin}></StaffTable>
                </div>
            );
        }
        if (opened == "Test") {
            return (
                <div>
                    <PatientsTable pollInterval={2000}></PatientsTable>
                </div>
            );
        }
    }
}

class PatientsTable extends React.Component {
    _isMounted = false;
    firstTime = true;
    constructor(props) {
        super(props);
        this.state = {
            _IsToggleOn: false, data: [], allData: [], staff: [], filteredData: [], assignedStaff: '', id: '', role: '', firstName: '', lastName: '', searchType: ''
        };

        this.handleAssignClick = this.handleAssignClick.bind(this);
        this.handleStaffClick = this.handleStaffClick.bind(this);

        this.handleToggle = this.handleToggle.bind(this);

        this.handleStaffChange = this.handleStaffChange.bind(this);
        this.handleRoleChange = this.handleRoleChange.bind(this);

        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchTypeChange = this.handleSearchTypeChange.bind(this);

        this.handleAssignSubmit = this.handleAssignSubmit.bind(this);
        this.handleSetStaffSubmit = this.handleSetStaffSubmit.bind(this);
    }
    loadUnassignedFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', '/unassignedpatients', true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                this.setState({ data: data });
                if (this.firstTime) {
                    this.setState({ filteredData: data });
                }
                this.firstTime = false;            
            };
            xhr.send();
        }
    }

    loadAllAssignedFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', '/allassignedpatients', true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                this.setState({ allData: data });
            };
            xhr.send();
        }
    }

    loadStaffFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', "/staffquerry", true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                this.setState({
                    staff: data,
                    assignedStaff: data[0].Staff_ID
                });
            };
            xhr.send();
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (!this.state._IsToggleOn) {
            this.loadUnassignedFromServer();
            window.setInterval(
                () => this.loadUnassignedFromServer(),
                this.props.pollInterval,
            );

            this.loadAllAssignedFromServer();
            window.setInterval(
                () => this.loadAllAssignedFromServer(),
                this.props.pollInterval,
            );
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.firstTime = true;
    }

    handleAssignClick = (patients) => {
        this.loadStaffFromServer();
        this.setState(state => ({
            id: patients.UserID,
        }));
        $("#assignPatientsModal").modal("show");
    }

    handleStaffChange(e) {
        this.setState({ assignedStaff: e.target.value });
        if (this.state._IsToggleOn) {
            this.loadAllAssignedFromServer();
            window.setInterval(
                () => this.loadAllAssignedFromServer(),
                this.props.pollInterval,
            );
        }
    }

    handleRoleChange(e) {
        this.setState({ role: e.target.value });
    }

    handleStaffClick = (patients) => {
        this.setState(state => ({
            id: patients.UserID,
            firstName: patients.FirstName,
            lastName: patients.LastName,
        }));
        $("#setStaffModal").modal("show");
    }

    handleAssignSubmit(e) {
        e.preventDefault();
        const assignedStaff = this.state.assignedStaff;
        const id = this.state.id;
        if (!id || !assignedStaff) {
            return;
        }
        const data = new FormData();
        data.append('assignedStaff', assignedStaff);
        data.append('id', id);
        $("#assignPatientsModal").modal("hide");
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/assignpatients', true);
        xhr.send(data);
    }

    handleSetStaffSubmit(e) {
        e.preventDefault();
        const id = this.state.id;
        const FirstName = this.state.firstName;
        const LastName = this.state.lastName;
        const Role = this.state.role;

        if (!id || !FirstName || !LastName || !Role) {
            return;
        }

        const data = new FormData();
        data.append('id', id);
        data.append('FirstName', FirstName);
        data.append('LastName', LastName);
        data.append('Role', Role);

        const xhr = new XMLHttpRequest();
        xhr.open('post', '/setusertostaff', true);
        xhr.send(data);
        $("#setStaffModal").modal("hide");
    }

    handleSearchTypeChange(e) {
        this.setState({ searchType: e.target.value });
    }

    handleToggle() {
        if (this.state._IsToggleOn) {
            this.setState({
                filteredData: this.state.data
            });
        }
        else {
            this.setState({
                filteredData: this.state.allData
            });
        }
        this.setState(state => ({
            _IsToggleOn: !state._IsToggleOn
        }));
    }

    handleSearchChange(e) {
        var currentList = [];
        var newList = [];
        var lc = '';

        // If the search bar isn't empty
        if (e.target.value !== "") {
            // Assign the original list to currentList
            if (this._IsToggleOn) {
                currentList = this.state.data;
            }
            else {
                currentList = this.state.allData;
            }
            // Use .filter() to determine which items should be displayed
            // based on the search terms
            newList = currentList.filter(item => {
                if (this.state.searchType == "patient") {
                    lc = item.LastName.toLowerCase();
                }
                if (this.state.searchType == "staff") {
                    lc = item.StaffLastName.toLowerCase();
                }
                else {
                    lc = item.LastName.toLowerCase();
                }
                // change search term to lowercase
                const filter = e.target.value.toLowerCase();
                // check to see if the current list item includes the search term
                // If it does, it will be added to newList. Using lowercase eliminates
                // issues with capitalization in search terms and search content
                return lc.includes(filter);
            });
        } else {
            if (this._IsToggleOn) {
                newList = this.state.data;
            }
            else {
                newList = this.state.allData;
            }
        }
        // Set the filtered state based on what our rules added to newList
        this.setState({
            filteredData: newList
        });
    }

    renderRow() {
        if (this.state._IsToggleOn) {
            return this.state.filteredData.map((patients, index) => {
                return (
                    <tr key={patients.UserID}>
                        <td>{patients.FirstName}</td>
                        <td>{patients.LastName}</td>
                        <td>{patients.StaffFirstName + ' ' + patients.StaffLastName}</td>
                        <td><button type="button" className="btn btn-primary" onClick={this.handleAssignClick.bind(this, patients)}>Re-Assign</button></td>
                        <td><button type="button" className="btn btn-primary" onClick={this.handleStaffClick.bind(this, patients)}>Set To Staff</button></td>
                    </tr>
                )
            })
        }
        else {
            return this.state.filteredData.map((patients, index) => {
                return (
                    <tr key={patients.UserID}>
                        <td>{patients.FirstName}</td>
                        <td>{patients.LastName}</td>
                        <td><button type="button" className="btn btn-primary" onClick={this.handleAssignClick.bind(this, patients)}>Assign</button></td>
                        <td><button type="button" className="btn btn-primary" onClick={this.handleStaffClick.bind(this, patients)}>Set To Staff</button></td>
                    </tr>
                )
            })
        }
        
    }

    renderDropboxOptions() {
        return this.state.staff.map((options) => {
            return (
                <option key={options.Staff_ID} value={options.Staff_ID}>{options.FirstName + " " + options.LastName}</option>
            )
        })
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-sm">
                        {this.state._IsToggleOn ?
                            <button type="button" className="btn btn-primary" onClick={this.handleToggle}> Unassigned Patients </button> :
                            <button type="button" className="btn btn-primary" onClick={this.handleToggle}> Assigned Patients </button>
                        }
                    </div>
                    <div className="col-sm">
                        {this.state._IsToggleOn ?
                            <select class="form-control" id="searchOptions" onChange={this.handleSearchTypeChange}>
                                <option value="patient">Patient (Last Name)</option>
                                <option value="staff">Staff (Last Name)</option>
                            </select>:
                            null
                        }
                        
                        <input type="text" className="input" onChange={this.handleSearchChange} placeholder="Search..." />
                    </div>
                </div>
                
                <table className="table table-striped table-bordered table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">FirstName</th>
                            <th scope="col">LastName</th>
                            {this.state._IsToggleOn ? <th>Assigned To</th> : null}
                            <th scope="col">Assign</th>
                            <th>Make Staff</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRow()}
                    </tbody>
                </table>

                <div className="modal fade" id="assignPatientsModal" role="dialog" aria-labelledby="assignPatientsModal" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title" id="myModalLabel">Assign Patients</h4>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form className="commentForm" onSubmit={this.handleAssignSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="staffDropDown">Avliable Staff</label>
                                        <select className="form-control" id="staffDropDown" onChange={this.handleStaffChange}>
                                            {this.renderDropboxOptions()}
                                        </select>
                                    </div>
                                    <div className="modal-footer">
                                        <button data-dismiss="modal" className="btn btn-danger mb-2">Cancel</button>

                                        <button type="submit" className="btn btn-primary mb-2">Assign</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="setStaffModal" role="dialog" aria-labelledby="setStaffModal" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title" id="myModalLabel">Assign Patients</h4>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form className="commentForm" onSubmit={this.handleSetStaffSubmit}>
                                    <div className="form-group col">
                                        <label htmlFor="staffRoleInput" className="row row-form-label">Staff Role</label>
                                        <div className="row">
                                            <input
                                                id="staffRoleInput"
                                                type="text"
                                                placeholder="Physiotherapist"
                                                value={this.state.role}
                                                onChange={this.handleRoleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button data-dismiss="modal" className="btn btn-danger mb-2">Cancel</button>

                                        <button type="submit" className="btn btn-primary mb-2">Assign</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class ExeriseTable extends React.Component {
    _isMounted = false;
    firstTime = true;

    constructor(props) {
        super(props);
        this.state = {
            data: [], filteredData: [], assignedPatients: [], patient: '', sets: '', repition: '', id: '', name: "", description: "", type: "", exerciseGroup: "", searchType: "", currentPage: 0
        };

        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleAssignClick = this.handleAssignClick.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);

        this.handleAssignSubmit = this.handleAssignSubmit.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);

        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchTypeChange = this.handleSearchTypeChange.bind(this);

        this.handlePatientChange = this.handlePatientChange.bind(this);
        this.handleSetsChange = this.handleSetsChange.bind(this);
        this.handleRepitionChange = this.handleRepitionChange.bind(this);

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleExerciseGroupChange = this.handleExerciseGroupChange.bind(this);
    }
    loadExerisesFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', "/exercises", true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                this.setState({
                    data: data,
                });
                if (this.firstTime) {
                    this.setState({
                        filteredData: data,
                    });
                }
                this.firstTime = false;
            };
            xhr.send();
        }
    }

    loadPatientsFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', "/assignedpatients", true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                this.setState({
                    assignedPatients: data,
                    patient: data[0].UserID
                });
            };
            xhr.send();
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.loadExerisesFromServer();
        window.setInterval(
            () => this.loadExerisesFromServer(),
            this.props.pollInterval,
        );
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.firstTime = true;
    }

    handleEditClick = (exercise) => {
        this.setState(state => ({
            id: exercise.Exercises_ID,
            name: exercise.Name,
            description: exercise.Description,
            type: exercise.Type,
            exerciseGroup: exercise.Exercise_Group
        }));
        $("#editExerciseModal").modal("show");
    }

    handleAssignClick = (exercise) => {
        this.loadPatientsFromServer();
        this.setState(state => ({
            id: exercise.Exercises_ID,
        }));
        
        $("#assignExerciseModal").modal("show");
    }

    handleDeleteClick = (id) => {
        const data = new FormData();
        data.append('id', id);

        const xhr = new XMLHttpRequest();
        xhr.open('post', '/deleteexercise', true);
        xhr.send(data);
    }

    handlePatientChange(e) {
        this.setState({ patient: e.target.value });
    }
    handleSetsChange(e) {
        this.setState({ sets: e.target.value });
    }
    handleRepitionChange(e) {
        this.setState({ repition: e.target.value });
    }
    handleNameChange(e) {
        this.setState({ name: e.target.value });
    }
    handleDescriptionChange(e) {
        this.setState({ description: e.target.value });
    }
    handleTypeChange(e) {
        this.setState({ type: e.target.value });
    }
    handleExerciseGroupChange(e) {
        this.setState({ exerciseGroup: e.target.value });
    }

    handleSearchTypeChange(e) {
        this.setState({ searchType: e.target.value });
    }

    handleAssignSubmit(e) {
        e.preventDefault();
        const patient = this.state.patient;
        const id = this.state.id;
        const sets = this.state.sets;
        const repition = this.state.repition;
        if (!id || !patient || !sets || !repition) {
            return;
        }
        const data = new FormData();
        data.append('patient', patient);
        data.append('id', id);
        data.append('sets', sets);
        data.append('repition', repition);
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/assignexercise', true);
        xhr.send(data);
        $("#assignExerciseModal").modal("hide");
    }

    handleEditSubmit(e) {
        e.preventDefault();
        const id = this.state.id;
        const name = this.state.name;
        const description = this.state.description;
        const type = this.state.type;
        const exerciseGroup = this.state.exerciseGroup;
        if (!id || !name || !description || !type || !exerciseGroup) {
            return;
        }
        const data = new FormData();
        data.append('id', id)
        data.append('name', name);
        data.append('description', description);
        data.append('type', type);
        data.append('exerciseGroup', exerciseGroup);
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/editexercise', true);
        xhr.send(data);
        $("#editExerciseModal").modal("hide");
    }

    handleSearchChange(e) {
        var currentList = [];
        var newList = [];
        var page = [];
        var lc = '';
        var count = 0;
        var pageCount = 0;
        // If the search bar isn't empty
        if (e.target.value !== "") {
            // Assign the original list to currentList
            currentList = this.state.data;

            // Use .filter() to determine which items should be displayed
            // based on the search terms
            newList = currentList.filter(item => {
                if (this.state.searchType == "name") {
                    lc = item.Name.toLowerCase();
                }
                if (this.state.searchType == "group") {
                    lc = item.Exercise_Group.toLowerCase();
                }
                if (this.state.searchType == "type") {
                    lc = item.Type.toLowerCase();
                }
                else {
                    lc = item.Name.toLowerCase();
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

    renderRow() {
        return this.state.filteredData.map((exercise, index) => {
            var imageLoaded = false;
            if (exercise.Image != null) {
                const data = exercise.Image;
                const Example = ({ data }) => <img src={`data:image/jpeg;base64,${data}`} height="200" width="200"/>
                return (
                    <tr key={exercise.Exercises_ID}>
                        <td>{exercise.Name}</td>
                        <td><Example data={data} /></td>
                        <td>{exercise.Description}</td>
                        <td>{exercise.Type}</td>
                        <td>{exercise.Exercise_Group}</td>
                        <td><button type="button" className="btn btn-primary" onClick={this.handleAssignClick.bind(this, exercise)}>Assign</button></td>
                        {this.props.admin ? <td> <button type="button" className="btn btn-primary" onClick={this.handleEditClick.bind(this, exercise)}>Edit</button></td> : null}
                        {this.props.admin ? <td><button type="button" className="btn btn-primary" onClick={this.handleDeleteClick.bind(this, exercise.Exercises_ID)}>Delete</button></td> : null}
                    </tr>
                )
            }
            else {
                return (
                    <tr key={exercise.Exercises_ID}>
                        <td>{exercise.Name}</td>
                        <td>No Image Found</td>
                        <td>{exercise.Description}</td>
                        <td>{exercise.Type}</td>
                        <td>{exercise.Exercise_Group}</td>
                        <td><button type="button" className="btn btn-primary" onClick={this.handleAssignClick.bind(this, exercise)}>Assign</button></td>
                        {this.props.admin ? <td> <button type="button" className="btn btn-primary" onClick={this.handleEditClick.bind(this, exercise)}>Edit</button></td> : null}
                        {this.props.admin ? <td><button type="button" className="btn btn-primary" onClick={this.handleDeleteClick.bind(this, exercise.Exercises_ID)}>Delete</button></td> : null}
                    </tr>
                )
            }
            
        })
    }

    renderDropboxOptions() {
        return this.state.assignedPatients.map((options) => {
            return (
                <option key={options.UserID} value={options.UserID}>{options.FirstName + " " + options.LastName}</option>
            )
        })
    }

    render() {

        return (
            <div className="">
                <div className="row">
                    <div className="col-sm">
                        <ExeriseAdd></ExeriseAdd>
                    </div>
                    <div className="col-sm">
                        <select className="form-control" id="searchOptions" onChange={this.handleSearchTypeChange}>
                            <option value="name">Name</option>
                            <option value="group">Group</option>
                            <option value="type">Type</option>
                        </select>
                        <input type="text" className="input" onChange={this.handleSearchChange} placeholder="Search..." />
                    </div>
                </div>
                <table className="table table-striped table-bordered table-hover" id="ExeriseTable">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Image</th>
                            <th scope="col">Description</th>
                            <th scope="col">Type</th>
                            <th scope="col">Exercise Group</th>
                            <th scope="col">Assign</th>
                            {this.props.admin ? <th scope="col">Edit</th> : null}
                            {this.props.admin ? <th scope="col">Delete</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderRow()}
                    </tbody>
                </table>
                <div className="modal fade" id="editExerciseModal" role="dialog" aria-labelledby="editExerciseModal" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title" id="myModalLabel">Edit Exerise</h4>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form className="commentForm" onSubmit={this.handleEditSubmit}>
                                    <div className="form-group col">
                                        <label htmlFor="exerciseNameInput" className="row row-form-label">Exercise Name</label>
                                        <div className="row">
                                            <input
                                                id="exerciseNameInput"
                                                type="text"
                                                placeholder="e.g Thumb Stretch"
                                                value={this.state.name}
                                                onChange={this.handleNameChange}
                                            />
                                        </div>
                                        <label htmlFor="exerciseDescriptionInput" className="row row-form-label">Exercise Description</label>
                                        <div className="row">
                                            <textarea className="form-control"
                                                id="exerciseDescriptionInput"
                                                placeholder="Exercise description goes here"
                                                value={this.state.description}
                                                onChange={this.handleDescriptionChange}
                                                rows="3">
                                            </textarea>
                                        </div>
                                        <label htmlFor="exerciseTypeInput" className="row row-form-label">Exercise Type</label>
                                        <div className="row">
                                            <input
                                                id="exerciseTypeInput"
                                                type="text"
                                                placeholder="e.g Hand"
                                                value={this.state.type}
                                                onChange={this.handleTypeChange}
                                            />
                                        </div>
                                        <label htmlFor="exerciseGroupInput" className="row row-form-label">Exercise Group</label>
                                        <div className="row">
                                            <input
                                                id="exerciseGroupInput"
                                                type="text"
                                                placeholder="e.g Tendon Glide"
                                                value={this.state.exerciseGroup}
                                                onChange={this.handleExerciseGroupChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button data-dismiss="modal" className="btn btn-danger mb-2">Cancel</button>

                                        <button type="submit" className="btn btn-primary mb-2">Submit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" id="assignExerciseModal" role="dialog" aria-labelledby="assignExerciseModal" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title" id="myModalLabel">Assign Exerise</h4>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form className="commentForm" onSubmit={this.handleAssignSubmit}>
                                    <div className="form-group col">
                                        <label htmlFor="patientDropDown" className="row row-form-label">Exercise Name</label>
                                        <div className="row">
                                            <select className="form-control" id="patientDropDown"  onChange={this.handlePatientChange}>
                                                {this.renderDropboxOptions()}
                                            </select>
                                        </div>
                                        <label htmlFor="exerciseSetsInput" className="row row-form-label">Sets of Exercise</label>
                                        <div className="row">
                                            <input
                                                id="exerciseSetsInput"
                                                type="text"
                                                pattern="[0-9]*"
                                                placeholder="e.g 10"
                                                value={this.state.sets}
                                                onChange={this.handleSetsChange}
                                            />
                                        </div>
                                        <label htmlFor="exerciseRepInput" className="row row-form-label">Repitions per day</label>
                                        <div className="row">
                                            <input
                                                id="exerciseRepInput"
                                                type="text"
                                                pattern="[0-9]*"
                                                placeholder="e.g 4"
                                                value={this.state.repition}
                                                onChange={this.handleRepitionChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button data-dismiss="modal" className="btn btn-danger mb-2">Cancel</button>

                                        <button type="submit" className="btn btn-primary mb-2">Assign</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class ExeriseAdd extends React.Component {

    constructor(props) {
        super(props);
        this.state = { name: '', description: '', type: '', exerciseGroup: '' , image: null};
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleExerciseGroupChange = this.handleExerciseGroupChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
    }

    componentWillUnmount() {

    }

    handleNameChange(e) {
        this.setState({ name: e.target.value });
    }
    handleDescriptionChange(e) {
        this.setState({ description: e.target.value });
    }
    handleTypeChange(e) {
        this.setState({ type: e.target.value });
    }
    handleExerciseGroupChange(e) {
        this.setState({ exerciseGroup: e.target.value });
    }

    handleImageChange = event => {

        console.log(event.target.files[0]);
        this.setState({ image: event.target.files[0] });
        console.log(this.state.image);
    }

    handleSubmit(e) {
        e.preventDefault();
        const name = this.state.name.trim();
        const description = this.state.description.trim();
        const type = this.state.type.trim();
        const exerciseGroup = this.state.exerciseGroup.trim();
        const imageFile = this.state.image; 
        console.log(this.state.image);
        console.log(imageFile);
        if (!name || !description || !type || !exerciseGroup || !imageFile) {
            return;
        }
        $("#addExerciseModal").modal("hide");
        const data = new FormData();
        data.append('name', name);
        data.append('description', description);
        data.append('type', type);
        data.append('exerciseGroup', exerciseGroup);
        data.append('image', this.state.image);

        for (var key of data.entries()) {
            console.log(key[0] + ', ' + key[1]);
        }

        console.log(data);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", '/addexercise', true);
        xhr.send(data);
    }

    modalShow() {
        $("#addExerciseModal").modal("show");
    }

    render() {
        return (
            <div>
                <button className="btn btn-primary" type="button" onClick={this.modalShow.bind()}>Add</button>
                <div className="modal fade" id="addExerciseModal" role="dialog" aria-labelledby="addExerciseModal" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title" id="myModalLabel">Add Exerise</h4>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <form className="commentForm" onSubmit={this.handleSubmit}>
                                    <div className="form-group col">
                                        <label htmlFor="exerciseNameInput" className="row row-form-label">Exercise Name</label>
                                        <div className="row">
                                            <input
                                                id="exerciseNameInput"
                                                type="text"
                                                placeholder="e.g Thumb Stretch"
                                                onChange={this.handleNameChange}
                                            />
                                        </div>
                                        <label htmlFor="exerciseDescriptionInput" className="row row-form-label">Exercise Description</label>
                                        <div className="row">
                                            <textarea
                                                className="form-control"
                                                id="exerciseDescriptionInput"
                                                placeholder="Exercise description goes here"
                                                onChange={this.handleDescriptionChange}
                                                rows="3">
                                            </textarea>
                                        </div>
                                        <label htmlFor="exerciseTypeInput" className="row row-form-label">Exercise Type</label>
                                        <div className="row">
                                            <input
                                                id="exerciseTypeInput"
                                                type="text"
                                                placeholder="e.g Hand"
                                                onChange={this.handleTypeChange}
                                            />
                                        </div>
                                        <label htmlFor="exerciseGroupInput" className="row row-form-label">Exercise Group</label>
                                        <div className="row">
                                            <input
                                                id="exerciseGroupInput"
                                                type="text"
                                                placeholder="e.g Tendon Glide"
                                                onChange={this.handleExerciseGroupChange}
                                            />
                                        </div>
                                        <label htmlFor="imageInput" className="row row-form-label">Exercise Image</label>
                                        <div className="row">
                                            <input
                                                id="imageInput"
                                                type="file"
                                                onChange={this.handleImageChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button data-dismiss="modal" className="btn btn-danger mb-2">Cancel</button>

                                        <button type="submit" className="btn btn-primary mb-2">Submit</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class StaffTable extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { data: [] };

        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleAdminAssignClick = this.handleAdminAssignClick.bind(this);
        this.handleAdminUnassignClick = this.handleAdminUnassignClick.bind(this);
    }
    loadStaffFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', this.props.url, true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                this.setState({ data: data });
            };
            xhr.send();
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.loadStaffFromServer();
        window.setInterval(
            () => this.loadStaffFromServer(),
            this.props.pollInterval,
        );
        
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleDeleteClick = (staff) => {
        const data = new FormData();
        data.append('id', staff.UserID);
        data.append('FirstName', staff.FirstName);
        data.append('LastName', staff.LastName);

        const xhr = new XMLHttpRequest();
        xhr.open('post', '/removestaff', true);
        xhr.send(data);
    }

    handleAdminAssignClick = (id) => {
        const data = new FormData();
        data.append('id', id);
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/assignadmin', true);
        xhr.send(data);
    }

    handleAdminUnassignClick = (id) => {
        const data = new FormData();
        data.append('id', id);
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/unassignadmin', true);
        xhr.send(data);
    }

    renderRow() {
        this.admim = false;
        return this.state.data.map((staff, index) => {
            if (staff.Role_ID == 3) {
                this.admin = true;
            };
            if (staff.Role_ID == 2) {
                this.admin = false;
            };
            return (
                <tr key={staff.Staff_ID}>
                    <td>{staff.FirstName}</td>
                    <td>{staff.LastName}</td>
                    <td>{staff.Role}</td>
                    <td><button type="button" className="btn btn-primary" onClick={this.handleDeleteClick.bind(this, staff)}>Remove</button></td>
                    <td>{this.admin ? <button type="button" className="btn btn-primary" onClick={this.handleAdminUnassignClick.bind(this, staff.UserID)}>Remove Admin</button> : <button type="button" className="btn btn-primary" onClick={this.handleAdminAssignClick.bind(this, staff.UserID)}>Set Admin</button>}</td>
                </tr>
            )
        })
    }


    render() {
        return (
            <table className="table table-striped table-bordered table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">FirstName</th>
                        <th scope="col">LastName</th>
                        <th scope="col">Role</th>
                        <th scope="col">Remove</th>
                        <th scope="col">Admin</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderRow()}
                </tbody>
            </table>
        );
    }
}

class AssignedPatients extends React.Component {
    _isMounted = false;
    firstTime = true;

    constructor(props) {
        super(props);
        this.state = { assignedPatients: [], patientExericses: [], filteredData: [], selectedPatient: 0, patient: '', id: '', sets: '', repition: '', description: '', searchType: ''};

        this.handlePatientChange = this.handlePatientChange.bind(this);
        this.handleSetsChange = this.handleSetsChange.bind(this);
        this.handleRepitionChange = this.handleRepitionChange.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);

        this.handleSendUpdate = this.handleSendUpdate.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchTypeChange = this.handleSearchTypeChange.bind(this);

        this.handleUnassignClick = this.handleUnassignClick.bind(this);
        this.handleEditClick = this.handleEditClick.bind(this);

        this.handleEditSubmit = this.handleEditSubmit.bind(this);
    }
    loadPatientsExerisesFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', '/patientsexersies', true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                this.setState({
                    patientExericses: data
                });
                if (this.firstTime) {
                    this.setState({
                        count: 0,
                        filteredData: data[0].PatientExercise
                    });
                    this.firstTime = false;
                }          
            };
            xhr.send();
        }
    }

    loadPatientsFromServer() {
        if (this._isMounted) {
            const xhr = new XMLHttpRequest();
            xhr.open('get', "/assignedpatients", true);
            xhr.onload = () => {
                const data = JSON.parse(xhr.responseText);
                this.setState({
                    assignedPatients: data,
                    patient: data[0].UserID
                });
            };
            xhr.send();
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.loadPatientsFromServer();
        window.setInterval(
            () => this.loadPatientsFromServer(),
            this.props.pollInterval,
        );
        this.loadPatientsExerisesFromServer();
        window.setInterval(
            () => this.loadPatientsExerisesFromServer(),
            this.props.pollInterval,
        );
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.firstTime = true;
    }

    getSelectedPatient(value) {
        this.state.count = 0;
        this.state.patientExericses.map((patient, index) => {
            if (patient.PatientID == value) {
                this.state.selectedPatient = this.state.count;
            }
            this.state.count = this.state.count + 1;
        });
        return this.state.selectedPatient;
    }

    handleEditClick = (exercise) => {
        this.setState({
            id: exercise.User_Exercise_ID,
            sets: exercise.Sets,
            repition: exercise.Repetitions,
            description: exercise.Description
            });
        $("#editAssignedModal").modal("show");
    }

    handleUnassignClick = (exercise) => {
        const data = new FormData();

        data.append('assignedId', exercise.User_Exercise_ID);
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/unassignexercise', true);
        xhr.send(data);
    }

    handleSetsChange(e) {
        this.setState({sets: e.target.value});
    }

    handleRepitionChange(e) {
        this.setState({ repition: e.target.value });
    }

    handleDescriptionChange(e) {
        this.setState({ description: e.target.value });
    }

    handleSearchTypeChange(e) {
        this.setState({ searchType: e.target.value });
    }

    handleSendUpdate(e) {
        e.preventDefault();
        const tableData = this.state.patientExericses[this.state.selectedPatient].PatientExercise;
        const patient = this.state.assignedPatients[this.state.selectedPatient].UserID;
        const name = this.state.assignedPatients[this.state.selectedPatient].FirstName + " " + this.state.assignedPatients[this.state.selectedPatient].LastName;
        if (!tableData) {
            return;
        }
        const data = new FormData();
        data.append('tableData', JSON.stringify(tableData));
        data.append('userID', patient);
        data.append('name', name)
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/updateexerciseemail', true);
        xhr.send(data);
    }

    handleSearchChange(e) {
        var currentList = [];
        var newList = [];
        var lc = '';

        // If the search bar isn't empty
        if (e.target.value !== "") {
            // Assign the original list to currentList
            currentList = this.state.patientExericses[this.state.selectedPatient].PatientExercise;

            // Use .filter() to determine which items should be displayed
            // based on the search terms
            newList = currentList.filter(item => {
                if (this.state.searchType == "name") {
                    lc = item.Name.toLowerCase();
                }
                if (this.state.searchType == "group") {
                    lc = item.Exercise_Group.toLowerCase();
                }
                if (this.state.searchType == "type") {
                    lc = item.Type.toLowerCase();
                }
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
            newList = this.state.patientExericses[this.state.selectedPatient].PatientExercise;
        }
        // Set the filtered state based on what our rules added to newList
        this.setState({
            filteredData: newList
        });
    }

    handlePatientChange(e) {

        this.setState({
            patient: e.target.value,
            selectedPatient: this.getSelectedPatient(e.target.value),
            filteredData: this.state.patientExericses[this.getSelectedPatient(e.target.value)].PatientExercise
        });
    }

    handleEditSubmit(e) {
        e.preventDefault();
        const id = this.state.id;
        const sets = this.state.sets;
        const repition = this.state.repition;
        const description = this.state.description;

        if (!id || !sets || !repition || !description) {
            return;
        }
        const data = new FormData();
        data.append('id', id)
        data.append('sets', sets); 
        data.append('repition', repition);
        data.append('description', description);
        $("#editExerciseModal").modal("hide");
        const xhr = new XMLHttpRequest();
        xhr.open('post', '/editassignedexercise', true);
        xhr.send(data);
        $("#editAssignedModal").modal("hide");
    }

    renderRow() {
        if (!this.state.patientExericses[this.state.selectedPatient]) {
            return (
                <tr>
                    <td>Name</td>
                    <td>Description</td>
                    <td>Type</td>
                    <td>Sets</td>
                    <td>Repetitions</td>
                    <td>Edit</td>
                    <td>Unassign</td>
                </tr>
             )
        }
        else {
            return this.state.filteredData.map((exercises, index) => {
                if (exercises.ImageData != null) {
                    const data = exercises.ImageData;
                    const Example = ({ data }) => <img src={`data:image/jpeg;base64,${data}`} height="200" width="200" />

                    return (
                        <tr key={exercises.Exercises_ID}>
                            <td>{exercises.Name}</td>
                            <td><Example data={data} /></td>
                            <td>{exercises.Description}</td>
                            <td>{exercises.Type}</td>
                            <td>{exercises.Exercise_Group}</td>
                            <td>{exercises.Sets}</td>
                            <td>{exercises.Repetitions}</td>
                            <td><button type="button" className="btn btn-primary" onClick={this.handleEditClick.bind(this, exercises)}>Edit</button></td>
                            <td><button type="button" className="btn btn-primary" onClick={this.handleUnassignClick.bind(this, exercises)}>Unassign</button></td>
                        </tr>
                    )
                }
                else {
                    return (
                        <tr key={exercises.Exercises_ID}>
                            <td>{exercises.Name}</td>
                            <td>No Image</td>
                            <td>{exercises.Description}</td>
                            <td>{exercises.Type}</td>
                            <td>{exercises.Exercise_Group}</td>
                            <td>{exercises.Sets}</td>
                            <td>{exercises.Repetitions}</td>
                            <td><button type="button" className="btn btn-primary" onClick={this.handleEditClick.bind(this, exercises)}>Edit</button></td>
                            <td><button type="button" className="btn btn-primary" onClick={this.handleUnassignClick.bind(this, exercises)}>Unassign</button></td>
                        </tr>
                    )
                }
            })
        }
        
    }

    renderDropboxOptions() {
        return this.state.assignedPatients.map((options) => {
            return (
                <option key={options.UserID} value={options.UserID}>{options.FirstName + " " + options.LastName}</option>
            )
        })
    }

    render() {
        if (this.state.assignedPatients === undefined) {
            <div>
                <p>No Information Found</p>
            </div>
        }
        else {
            return (
                <div>
                    <div className="row">
                        <div className="col-sm">
                            <label htmlFor="selectPatient">My Patients</label>
                            <select className="form-control" id="selectPatient" onChange={this.handlePatientChange}>
                                {this.renderDropboxOptions()}
                            </select>
                        </div>
                        <div>
                            <button type="button" className="btn btn-primary" onClick={this.handleSendUpdate}>SendUpdate</button>
                        </div>
                        <div className="col-sm">
                            <select className="form-control" id="searchOptions" onChange={this.handleSearchTypeChange}>
                                <option value="name">Name</option>
                                <option value="group">Group</option>
                                <option value="type">Type</option>
                            </select>
                            <input type="text" className="input" onChange={this.handleSearchChange} placeholder="Search..." />
                        </div>
                    </div>
                    
                    <table className="table table-striped table-bordered table-hover" id="patientExeriseTable">
                        <thead className="thead-dark">
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Image</th>
                                <th scope="col">Description</th>
                                <th scope="col">Type</th>
                                <th scope="col">Group</th>
                                <th scope="col">Sets</th>
                                <th scope="col">Repetitions</th>
                                <th scope="col">Edit</th>
                                <th scope="col">Unassign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderRow()}
                        </tbody>
                    </table>
                    <div className="modal fade" id="editAssignedModal" role="dialog" aria-labelledby="editAssignedModal" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title" id="myModalLabel">Edit Exerise For Patient</h4>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">×</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <form className="commentForm" onSubmit={this.handleEditSubmit}>
                                        <div className="form-group col">
                                            <label htmlFor="exerciseDescriptionInput" className="row row-form-label">Exercise Description</label>
                                            <div className="row">
                                                <textarea className="form-control"
                                                    id="exerciseDescriptionInput"
                                                    placeholder="Exercise description goes here"
                                                    value={this.state.description}
                                                    onChange={this.handleDescriptionChange}
                                                    rows="3">
                                                </textarea>
                                            </div>
                                            <label htmlFor="exerciseSetsInput" className="row row-form-label">Sets of Exercise</label>
                                            <div className="row">
                                                <input
                                                    id="exerciseSetsInput"
                                                    type="text"
                                                    pattern="[0-9]*"
                                                    placeholder="e.g 10"
                                                    value={this.state.sets}
                                                    onChange={this.handleSetsChange}
                                                />
                                            </div>
                                            <label htmlFor="exerciseRepInput" className="row row-form-label">Repitions per day</label>
                                            <div className="row">
                                                <input
                                                    id="exerciseRepInput"
                                                    type="text"
                                                    pattern="[0-9]*"
                                                    placeholder="e.g 4"
                                                    value={this.state.repition}
                                                    onChange={this.handleRepitionChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button data-dismiss="modal" className="btn btn-danger mb-2">Cancel</button>

                                            <button type="submit" className="btn btn-primary mb-2">Submit</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
    }
}

ReactDOM.render(<ButtonList />, document.getElementById('content'));
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { editUser } from '@/actions/user'
import {
  getError as getUserError,
  getIsEditing as getUserIsEditing
} from '@/reducers/user'

class Terms extends Component {
  state = {
    accepted: false,
    redirectTo: null
  }

  handleSubmit = async () => {
    const result = await this.props.editUser({
      termsAgreedAt: moment()
    })
    if (result.type === 'EDIT_USER_SUCCESS') {
      this.setState({ redirectTo: '/phone' })
    }
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }

    return (
      <>
        <div className="action-card">
          <h1>
            Great!
            <br />
            Please review our Terms of Use
          </h1>
          <p>Please agree to our terms below and click Continue to proceed</p>
          <div className="form-group">
            <div className="terms-wrapper">
              The recipient acknowledges that he, she or it has been advised
              that the offers and sales of OGN have not been registered under
              any country’s securities laws and, therefore, cannot be resold
              except in compliance with the applicable country’s laws. Based on
              recent guidance from the SEC, it is possible that transfers of OGN
              would be deemed to be securities offerings in the United States at
              launch. While we plan to work towards meeting the standards set by
              various jurisdictions around the world, including the United
              States, for transfers of OGN to not be considered offers and sales
              of securities in those jurisdictions, we cannot assure you that
              those standards have been met as of now. In recognition of the
              foregoing, the recipient covenants to the Company that it will
              comply with all applicable laws, including United States
              securities laws, with respect to any transfer of OGN as if OGN was
              a security under the laws of the United States.
              <br />
              <br />
              The recipient acknowledges that he, she or it is solely
              responsible for maintaining the security of his, her or its login
              password as well as maintaining a secure backup.
            </div>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="acceptCheck"
              onClick={e => this.setState({ accepted: e.target.checked })}
            />
            <label className="form-check-label mt-0" htmlFor="acceptCheck">
              I have read and agree to the terms and conditions
            </label>
          </div>
          <button
            className="btn btn-secondary btn-lg mt-5"
            onClick={this.handleSubmit}
            disabled={!this.state.accepted || this.props.userIsEditing}
          >
            Continue
          </button>
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ user }) => {
  return {
    userError: getUserError(user),
    userIsEditing: getUserIsEditing(user)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      editUser: editUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Terms)

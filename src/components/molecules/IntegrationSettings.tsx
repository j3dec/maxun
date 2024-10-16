import React, { useState, useEffect } from 'react';
import { GenericModal } from "../atoms/GenericModal";
import { MenuItem, TextField, Typography, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import axios from 'axios';
import { modalStyle } from "./AddWhereCondModal";

interface IntegrationProps {
    isOpen: boolean;
    handleStart: (data: IntegrationSettings) => void;
    handleClose: () => void;
}

export interface IntegrationSettings {
    credentials: string;
    spreadsheetId: string;
    range: string;
    data: string;
}

export const IntegrationSettingsModal = ({ isOpen, handleStart, handleClose }: IntegrationProps) => {
    const [settings, setSettings] = useState<IntegrationSettings>({
        credentials: '',
        spreadsheetId: '',
        range: '',
        data: '',
    });
    const [spreadsheets, setSpreadsheets] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Fetch Google Sheets from backend when modal is opened
            setLoading(true);
            axios.get('http://localhost:8080/auth/google/callback')
                .then(response => {
                    setSpreadsheets(response.data.files);
                    setLoading(false);
                })
                .catch(error => {
                    setError(`Error fetching spreadsheets: ${error}`);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    const handleChange = (field: keyof IntegrationSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [field]: e.target.value });
    };

    const handleSpreadsheetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, spreadsheetId: e.target.value });
    };

    return (
        <GenericModal
            isOpen={isOpen}
            onClose={handleClose}
            modalStyle={modalStyle}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginLeft: '65px',
            }}>
                <Typography sx={{ margin: '20px 0px' }}>Google Sheets Integration</Typography>

                <TextField
                    sx={{ marginBottom: '15px' }}
                    label="Service Account JSON"
                    multiline
                    rows={10}
                    required
                    value={settings.credentials}
                    onChange={handleChange('credentials')}
                    fullWidth
                />

                {loading ? (
                    <CircularProgress sx={{ marginBottom: '15px' }} />
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <TextField
                        sx={{ marginBottom: '15px' }}
                        select
                        label="Select Google Spreadsheet"
                        required
                        value={settings.spreadsheetId}
                        onChange={handleSpreadsheetSelect}
                        fullWidth
                    >
                        {spreadsheets.map(sheet => (
                            <MenuItem key={sheet.id} value={sheet.id}>
                                {sheet.name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                <TextField
                    sx={{ marginBottom: '15px' }}
                    label="Range (e.g., Sheet1!A1:B2)"
                    required
                    value={settings.range}
                    onChange={handleChange('range')}
                    fullWidth
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleStart(settings)}
                    style={{ marginTop: '10px' }}
                    disabled={loading}
                >
                    Submit
                </Button>
            </div>
        </GenericModal>
    );
};
